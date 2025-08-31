import ballerina/time;
import ballerina/sql;

type Route record {|
    int? id = ();
    string A_Name;
    decimal A_LAT;
    decimal A_LON;
    string B_Name;
    decimal B_LAT;
    decimal B_LON;
    string polyline;
    decimal distance;
|};

type Location record {|
    decimal Loc_LAT;
    decimal Loc_LON;
|};

type LocationUpdate record {|
    int id;
    *Location;
|};

type Direction "forward" | "backward";

type Trip record {|
    int? id = ();
    int Route_Id;
    Direction Direction;
    *Location;
    decimal Loc_Frac;
    time:Civil Loc_TimeStamp;
|};

type Place record {|
    @sql:Column {name: "id"}
    int place_id;
    @sql:Column {name: "Loc_LAT"}
    decimal lat;
    @sql:Column {name: "Loc_LON"}
    decimal lon;
    @sql:Column {name: "Name"}
    string name;
|};

