#!/usr/bin/python3
import sqlite3
import Adafruit_DHT
import sys
import time
import os
STD_SENSOR_GPIO_PIN = 4
STD_SENSOR_TYPE = Adafruit_DHT.DHT22
STD_SENSOR_TMP_LIMITS = {"min":0, "max":80}
STD_SENSOR_HUM_LIMITS = {"min":20, "max":80}
STD_SENSOR_HUM_DB_ID = 2
STD_SENSOR_HUM_SHORTNAME = "whatshot"
STD_SENSOR_HUM_NAME = "Luftfeuchtigkeit"
STD_SENSOR_HUM_TYPE = "%"
STD_SENSOR_TMP_DB_ID = 1
STD_SENSOR_TMP_SHORTNAME = "wb_sunny"
STD_SENSOR_TMP_NAME = "Temperatur"
STD_SENSOR_TMP_TYPE = "°C"
STD_LOG_PATH = "/var/log/dht22"
STD_DB_PATH = "/opt/cliamteLog/data.db"
STD_DB_MAXRETRY = 5
STD_TIME_WAIT_SECONDS = 30
#Init workingVars with std. Values
SENSOR = STD_SENSOR_TYPE
PIN = STD_SENSOR_GPIO_PIN
LOGPATH = STD_LOG_PATH
DBPATH = STD_DB_PATH
DB_MAXTRY = STD_DB_MAXRETRY
SENSOR_HUM_LIMITS = STD_SENSOR_HUM_LIMITS
SENSOR_TMP_LIMITS = STD_SENSOR_TMP_LIMITS
TIME_WAIT_SECONDS = STD_TIME_WAIT_SECONDS
SENSOR_HUM_DB_ID = STD_SENSOR_HUM_DB_ID
SENSOR_TMP_DB_ID = STD_SENSOR_TMP_DB_ID
SENSOR_HUM_SHORTNAME = STD_SENSOR_HUM_SHORTNAME
SENSOR_HUM_NAME = STD_SENSOR_HUM_NAME
SENSOR_HUM_TYPE = STD_SENSOR_HUM_TYPE
SENSOR_TMP_SHORTNAME = STD_SENSOR_TMP_SHORTNAME
SENSOR_TMP_NAME = STD_SENSOR_TMP_NAME
SENSOR_TMP_TYPE = STD_SENSOR_TMP_TYPE
DIRDELIM = "/"

#Function definitions
def printUsageInfo():
    print("ClimateLogger for Rasperry Pi with DHT22 Sensor")
    print("Usage: ")
    print("\t./dht22.py [--GPIO=] [--LOGPATH=] [--DBPATH=] [--WAIT=] [-h | --help]")
    print("\t\t--GPIO= defines the GPIO Pin the Sensor is connected to")
    print("\t\t--LOGPATH= defines the Path (folder) the logfiles are stored in")
    print("\t\t--DBPATH= defines the Path (filename) the database is stored in")
    print("\t\t--WAIT= defines the seconds to wait between measures (need to be above 10 Seconds)")
    print("\t\t-h |--help prints this help")

def parseArguments(args):
    args.pop()
    for arg in args:
        if "--help" in arg:
            printUsageInfo()
            exit(0)
        elif "-h" in arg:
            printUsageInfo()
            exit(0)
        elif "--GPIO=" in arg:
            PIN = arg.rsplit("=", 1)
        elif "--LOGPATH=" in arg:
            LOGPATH = arg.rsplit("=", 1)
        elif "--DBPATH=" in arg:
            DBPATH = arg.rsplit("=", 1)
        elif "--WAIT=" in arg:
            TIME_WAIT_SECONDS = arg.rsplit("=", 1)
        else:
            print("Unknown parameter:", arg)

def checkVars():
    if type(PIN) != int:
        print("PIN ist keine Zahl.")
        exit(1)
    if type(LOGPATH) != str:
        print("LOGPATH ist kein Pfad.")
        exit(1)
    if type(DBPATH) != str:
        print("DBPATH ist kein Pfad.")
        exit(1)
    if type(TIME_WAIT_SECONDS) != int:
        print("TIME_WAIT_SECONDS ist keine Zahl.")
        exit(1)

def getDatenFromSensor():
    humidity, temperature = Adafruit_DHT.read_retry(SENSOR, PIN)
    #print("Feuchtigkeit", humidity, "Temperatur", temperature)
    if (humidity is not None) and (temperature is not None):
        return {"hum":humidity, "tmp":temperature}
    else:
        return None
def checkDataFromSensor(hum, tmp):
    if (SENSOR_HUM_LIMITS["min"] > hum) or (SENSOR_HUM_LIMITS["max"] < hum):
        print("Humidity is out of range: ", hum)
        return None
    if (SENSOR_TMP_LIMITS["min"] > tmp) or (SENSOR_TMP_LIMITS["max"] < tmp):
        print("Temperature is out of range: ", tmp)
        return None
    return {"hum":hum, "tmp":tmp}
def deleteDBFile():
    try:
        os.remove(DBPATH)
    except BaseException as e:
        print("failed to remove miscreated DB file", e)

def createPath(path):
    if path == "/":
        return False
    if not os.path.exists(path):
        if not os.path.exists(os.path.exists(DBPATH.rsplit(DIRDELIM, 1)[0])):
            createPath(os.path.exists(DBPATH.rsplit(DIRDELIM, 1)[0]))
        else:
            try:
                os.mkdir(path)
                return True
            except BaseException as e:
                print("failed to create dir", e)
                return False

def createDBFile():
    if not createPath(DBPATH.rsplit(DIRDELIM, 1)[0]):
        print("can't create DB Path")
        return False
    try:
        db = sqlite3.connect(DBPATH)
    except BaseException as e:
        print("failed to create DB file", e)
        return False
    if db is None:
        return False
    cursor = db.cursor()
    createData = """CREATE TABLE data
                    (
                        id INTEGER PRIMARY KEY,
                        fk_messungen NUMERIC,
                        fk_sensor NUMERIC,
                        value NUMERIC
                    );"""
    createMessungen = """CREATE TABLE messungen
                        (
                            id INTEGER PRIMARY KEY,
                            timestamp TIMESTAMP,
                            comment TEXT
                        );"""
    createSensor = """CREATE TABLE sensor
                        (
                            shortname TEXT,
                            id INTEGER PRIMARY KEY,
                            name TEXT,
                            type TEXT
                        );"""
    cursor.execute(createData)
    db.commit()
    checkData = "SELECT MAX(id) FROM data"
    if not cursor.execute(checkData).fetchall():
        print("failed to create table 'data'")
        deleteDBFile()
        return False
    cursor.execute(createMessungen)
    db.commit()
    checkMessungen = "SELECT MAX(id) FROM messungen"
    if not cursor.execute(checkMessungen).fetchall():
        print("failed to create table 'data'")
        deleteDBFile()
        return False
    cursor.execute(createSensor)
    db.commit()
    checkSensor = "SELECT MAX(id) FROM sensor"
    if not cursor.execute(checkSensor).fetchall():
        print("failed to create table 'data'")
        deleteDBFile()
        return False

    db.close()
    return True

def connectDB():
    if not os.path.isfile(DBPATH):
        if not createDBFile():
            print("DB file could not be created")
            exit(1)
    db = sqlite3.connect(DBPATH)
    if db is not None:
        print("DB connect successfully")
    else:
        print("DB connect failed")
    return db

def writeDataToDB(db, hum, tmp, tries):
    if DB_MAXTRY <= tries:
        print("max failures reached. Nothing will be written to DB")
        return False
    tries = int(tries)+1
    hum = round(hum, 1)
    tmp = round(tmp, 1)
    print("hum:", hum, "tmp:", tmp)
    timestamp = time.strftime('"%Y-%m-%d %H:%M:%S"')
    print("Timestamp: ",timestamp)
    cursor = db.cursor()
    sqlHumSensorExist = "SELECT COUNT(id) FROM sensor WHERE id = " \
                        + str(SENSOR_HUM_DB_ID)\
                        + " ;"
    returnval = cursor.execute(sqlHumSensorExist).fetchone()
    if returnval[0] == 0:
        insertSQL = "INSERT INTO sensor(shortname, id, name, type) VALUES ('" \
                    + SENSOR_HUM_SHORTNAME \
                    + "', " \
                    + str(SENSOR_HUM_DB_ID) \
                    + ", '" \
                    + SENSOR_HUM_NAME \
                    + "', '" \
                    + SENSOR_HUM_TYPE \
                    + "');"
        cursor.execute(insertSQL)
        sensorReturnval = cursor.execute(sqlHumSensorExist).fetchone()
        if sensorReturnval[0] == 0:
            print("failed to insert sensor HUM into DB")
            db.rollback()
            return writeDataToDB(db, hum, tmp, tries)


    sqlTmpSensorExist = "SELECT COUNT(id) FROM sensor WHERE id = " \
                        + str(SENSOR_TMP_DB_ID) \
                        + " ;"
    returnval = cursor.execute(sqlTmpSensorExist).fetchone()
    if returnval[0] == 0:
        insertSQL = "INSERT INTO sensor(shortname, id, name, type) VALUES ('" \
                    + SENSOR_TMP_SHORTNAME \
                    + "', '" \
                    + str(SENSOR_TMP_DB_ID) \
                    + "', '" \
                    + SENSOR_TMP_NAME \
                    + "', '" \
                    + SENSOR_TMP_TYPE \
                    + "');"
        cursor.execute(insertSQL)
        sensorReturnval = cursor.execute(sqlTmpSensorExist).fetchone()
        if sensorReturnval[0] == 0:
            print("failed to insert sensor TMP into DB")
            db.rollback()
            return writeDataToDB(db, hum, tmp, tries)


    sqlMessung = "INSERT INTO messungen(timestamp) "\
                    + "VALUES (" \
                    + timestamp \
                    +");"
    cursor.execute(sqlMessung)
    sqlMessungenID = "SELECT id " \
                    + "FROM messungen " \
                    + "WHERE timestamp = " \
                    + timestamp \
                    + ";"
    messungsID = cursor.execute(sqlMessungenID).fetchone()[0]
    if not messungsID:
        print("failed to insert measure into DB")
        db.rollback()
        return writeDataToDB(db, hum, tmp, tries)
    #ToDo make Sensor ID variable
    sqlHumidity = "INSERT INTO data(fk_messungen, fk_sensor, value) "\
                    + "VALUES ("\
                    + str(messungsID) \
                    + ", " \
                    + str(SENSOR_HUM_DB_ID)\
                    + ", " \
                    + str(hum)\
                    + ");"
    cursor.execute(sqlHumidity)
    sensorCheck = "SELECT id " \
                    +"FROM data " \
                    +"WHERE fk_messungen = " \
                    + str(messungsID) \
                    +" AND fk_sensor = " \
                    + str(SENSOR_HUM_DB_ID)\
                    + " ;"
    humID = cursor.execute(sensorCheck).fetchone()
    if not humID:
        print("failed to insert humidity data into DB")
        db.rollback()
        return writeDataToDB(db, hum, tmp, tries)

    sqlTemperature = "INSERT INTO data(fk_messungen, fk_sensor, value) "\
                    + "VALUES ("\
                    + str(messungsID) \
                    + ", " \
                    + str(SENSOR_TMP_DB_ID)\
                    + ", " \
                    + str(tmp)\
                    + ");"
    cursor.execute(sqlTemperature)
    sensorCheck = "SELECT id " \
                  + "FROM data " \
                  + "WHERE fk_messungen = " \
                  + str(messungsID) \
                  + " AND fk_sensor = " \
                  + str(SENSOR_TMP_DB_ID) \
                  + ";"
    tmpID = cursor.execute(sensorCheck).fetchone()
    if not tmpID:
        print("failed to insert temperature data into DB")
        db.rollback()
        return writeDataToDB(db, hum, tmp, tries)
    db.commit()
    print("data successfully inserted into DB")
    return True

def main():
    parseArguments(sys.argv)
    checkVars()


    while True:
        db = connectDB()
        if db is None:
            exit(1)
        returnval = getDatenFromSensor()
        if returnval is None:
            print("no data received")
        else:
            print("received data")
            returnval = checkDataFromSensor(returnval["hum"], returnval["tmp"])
            if returnval is None:
                print("Data is not acceptable")
            else:
                print("Data plausible")
                if writeDataToDB(db, returnval["hum"], returnval["tmp"], 0):
                    print("Data written to DB")
                else:
                    print("Data could not be written to DB")

        db.close()
        time.sleep(TIME_WAIT_SECONDS)

#Code run after start
main()