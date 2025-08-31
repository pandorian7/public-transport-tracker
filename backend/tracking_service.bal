import ballerina/http;
import ballerina/sql;
import ballerina/time;

service / on new http:Listener(9090) {

    final http:Client openStreet;
    final http:Client osrm;

    function init() returns error? {
        self.openStreet = check new ("https://nominatim.openstreetmap.org");
        self.osrm = check new ("http://osrm-lk:5000");
    }

    resource function get routes() returns Route[]|error {
        stream<Route, sql:Error?> routes = db->query(`SELECT * FROM routes`);
        return from Route reoute in routes
            select reoute;
    }

    resource function get routes/search(string query) returns json|error {
        json[] res = check self.openStreet->/search(q = query, 'limit = 5, format = "json");
        Place[] places = from json item in res
            let Place place = {
                place_id: check item.place_id,
                lat: check decimal:fromString(check item.lat),
                lon: check decimal:fromString(check item.lon),
                name: check item.display_name
            }
            select place;
        sql:ParameterizedQuery[] db_entries = from Place place in places
            select `INSERT IGNORE INTO places (id, Name, Loc_LAT, Loc_LON)
                    VALUES(${place.place_id}, ${place.name}, ${place.lat}, ${place.lon})`;
        _ = check db->batchExecute(db_entries);
        return places;
    }

    resource function get routes/segment(int A, int B) returns Route|http:NotFound|error {

        Place|sql:Error PointA = db->queryRow(`SELECT * FROM places WHERE id = ${A}`);

        if PointA is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        if PointA is sql:Error {
            return PointA;
        }

        Place|sql:Error PointB = db->queryRow(`SELECT * FROM places WHERE id = ${B}`);

        if PointB is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        if PointB is sql:Error {
            return PointB;
        }

        if (PointA.name > PointB.name) {
            Place tmp = PointA;
            PointA = PointB;
            PointB = tmp;
        }

        if (PointA is error || PointB is error) {
            return error("assert");
        }

        string coordinates = string `${PointA.lon},${PointA.lat};${PointB.lon},${PointB.lat}`;

        json data = check self.osrm->/route/v1/car/[coordinates]();

        json res = (<json[]>(check data.routes))[0];

        string geometry = check res.geometry;

        decimal distance = check res.distance;

        _ = check db->execute(`
            INSERT IGNORE INTO routes (A_Name, A_LAT, A_LON, B_Name, B_LAT, B_LON, Polyline, Distance)
            VALUES (${PointA.name}, ${PointA.lat}, ${PointA.lon}, ${PointB.name},
                ${PointB.lat}, ${PointB.lon}, ${geometry}, ${distance}
            )
        `);

        Route route = check db->queryRow(`SELECT * FROM routes 
        WHERE A_Name = ${PointA.name} AND B_Name = ${PointB.name}`);

        return route;

    }

    resource function get routes/[int id]() returns Route|http:NotFound|error {
        Route|sql:Error result = db->queryRow(`SELECT * FROM routes WHERE id = ${id}`);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        } else {
            return result;
        }
    }

    resource function get trips() returns Trip[]|error {
        stream<Trip, sql:Error?> trips = db->query(`SELECT * FROM trips`);
        return from Trip trip in trips
            select trip;
    }

    resource function get trips/[int id]() returns Trip|http:NotFound|error {
        Trip|sql:Error trip = db->queryRow(`SELECT * FROM trips WHERE id = ${id}`);

        if trip is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return trip;
    }

    resource function post trips(int route_id, Direction direction) returns Trip | http:NotFound|error {

        Route|sql:Error route = db->queryRow(`SELECT * FROM routes WHERE id = ${route_id}`);

        if route is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        if route is error {
            return route;
        }

        decimal Loc_LAT;
        decimal Loc_LON;

        if direction == "forward" {
            Loc_LAT = route.A_LAT;
            Loc_LON = route.A_LON;
        } else {
            Loc_LAT = route.B_LAT;
            Loc_LON = route.B_LON;
        }

        Trip trip = {
            Route_Id: route_id,
            Direction: direction,
            Loc_LAT: Loc_LAT,
            Loc_LON: Loc_LON,
            Loc_Frac: 0,
            Loc_TimeStamp: time:utcToCivil(time:utcNow())
        };

        var result = check db->execute(`INSERT INTO trips (Route_Id, Direction, Loc_LAT, Loc_LON, Loc_Frac, Loc_TimeStamp)
        VALUES (${route_id}, ${direction}, ${trip.Loc_LAT}, ${trip.Loc_LON}, ${trip.Loc_Frac}, ${trip.Loc_TimeStamp})`);


        int trip_id = <int>result.lastInsertId;

        trip.id = trip_id;

        return trip;

    }

    resource function put trips/[int id](@http:Payload Location location) returns Trip | http:NotFound | error {

        Trip|sql:Error trip = db->queryRow(`SELECT * FROM trips WHERE id = ${id}`);

        if trip is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        if trip is sql:Error {
            return trip;
        }

        var timestamp = time:utcToCivil(time:utcNow());

        trip.Loc_LAT = location.Loc_LAT;
        trip.Loc_LON = location.Loc_LON;

        // update fraction

        trip.Loc_TimeStamp = timestamp;

        _ = check db->execute(`INSERT INTO locations (Trip_Id, Loc_LAT, Loc_LON, Loc_Frac, Loc_TimeStamp)
            VALUES (${id}, ${trip.Loc_LAT}, ${trip.Loc_LON}, ${trip.Loc_Frac}, ${trip.Loc_TimeStamp})`);

        _ = check db->execute(`UPDATE trips SET Loc_LAT = ${trip.Loc_LAT}, Loc_LON = ${trip.Loc_LON},
            Loc_Frac = ${0}, Loc_TimeStamp = ${trip.Loc_TimeStamp} where id = ${id}`);

        return trip;
    } 
}
