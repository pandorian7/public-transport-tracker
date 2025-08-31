import ballerina/http;
import ballerina/sql;
import ballerina/io;

service / on new http:Listener(9090) {

    final http:Client openStreet;
    final http:Client osrm;

    function init() returns error? {
        self.openStreet = check new ("https://nominatim.openstreetmap.org");
        self.osrm = check new("http://osrm-lk:5000");
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

    resource function get routes/segment(int A, int B) returns Route | http:NotFound | error {

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

        io:println(res);

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
}
