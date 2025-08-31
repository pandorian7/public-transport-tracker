import ballerinax/mysql.driver as _;
import ballerinax/mysql;
import ballerina/os;

public final mysql:Client db = check new (
    "database", 
    "root", 
    os:getEnv("MYSQL_ROOT_PASSWORD"), 
    "BUS_TRANSPORT", 
    3306
);