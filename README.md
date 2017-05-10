# climateLoggerWebUI
Logging climate data from RaspberryPi Model B with an DHT22/AM2302 digitaler Sensor. Datalogging will be posible local and in remote database. 

## Current working Version
Based on the [lol_dht22](https://github.com/technion/lol_dht22) from User [technion](https://github.com/technion) and the (wiringPi)[http://wiringpi.com/] Libraris. 

### Build
Download and build wiringPi libs

 `git clone https://github.com/maexbower/climateLoggerWebUI.git`
 
 `cd ./climateLoggerWebUI`
 
 `./configure`
 
 `make`
 
### Run
The lol_dht22 binary is configured in a way that it will omit unnesacary output when running with Parameters.

`sudo ./loldht`

## New Development Version
Rewritten in Python.

### Dependecies
This Program takes advantage of [Adafruits Python DHT](https://github.com/adafruit/Adafruit_Python_DHT) Library.

Therefore you'll need the following Packages:

 `git`

 `build-essential` 
 
 `python3.4-dev` or `python-devel` for usage with python2
 
The programm itself needs the following packages:

 A python interpreter `python3` or `python` for Python2

 A webserver like `apache2`
 
 A PHP interpreter like `php5`
 
 The PHP interpreter SQLite module `php5-sqlite`
 
### Build
The tool itself doesn't need any build steps but the prerequisites do:

 `cd /tmp`
 
 `git clone https://github.com/adafruit/Adafruit_Python_DHT.git`
 
 `cd Adafruit_Python_DHT`
 
 `python3 ./setup.py install`
 
If you want to run the Script with python2 you need to run the setup.py with the `python` command

### Install
The Programm is designed to run from every directory.
Here is an example configuration:

    `cd /opt`
    
    `git clone https://github.com/maexbower/climateLoggerWebUI.git ./climateLog`
    
    

### Run
Always remember that the programm needs to be run as root to access the GPIO Port.

A normal user would call the