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