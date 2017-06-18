# climateLoggerWebUI
Logging climate data from RaspberryPi Model B with an DHT22/AM2302 digitaler Sensor. Data logging will be possible local and in remote database. 

## Current working Version
Based on the [lol_dht22](https://github.com/technion/lol_dht22) from User [technion](https://github.com/technion) and the (wiringPi)[http://wiringpi.com/] Libraris. 

### Build
Download and build wiringPi libs

 `git clone https://github.com/maexbower/climateLoggerWebUI.git`
 
 `cd ./climateLoggerWebUI`
 
 `./configure`
 
 `make`
 
### Run
The lol_dht22 binary is configured in a way that it will omit unnecessary output when running with Parameters.

`sudo ./loldht`

## New Development Version
Rewritten in Python.

### Dependencies
This Program takes advantage of [Adafruits Python DHT](https://github.com/adafruit/Adafruit_Python_DHT) Library.

Therefore you'll need the following Packages:

 `git`

 `build-essential` 
 
 `python3.4-dev` or `python-devel` for usage with python2
 
The program itself needs the following packages:

 A python interpreter `python3` or `python` for Python2

 A web server like `apache2`
 
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
The program is designed to run from every directory.
Here is an example configuration:

    `cd /opt`
    
    `git clone https://github.com/maexbower/climateLoggerWebUI.git ./climateLog`
    
### Config
#### dht22.py
At the top of the python script you'll find the following parms:

```python
     STD_SENSOR_GPIO_PIN = 4  #GPIO Number where the data wire of the sensor is connected
     STD_SENSOR_TYPE = Adafruit_DHT.DHT22   #Corresponding object for your sensor in the adafruit lib
     STD_SENSOR_TMP_LIMITS = {"min":0, "max":80} #Value limitations (lower / upper) for temperature to dismiss unrealistic values
     STD_SENSOR_HUM_LIMITS = {"min":20, "max":80} #Value limitations (lower / upper) for humidity to dismiss unrealistic values
     STD_SENSOR_HUM_DB_ID = 2 #Database Sensor ID for the Humidity Sensor
     STD_SENSOR_HUM_SHORTNAME = "whatshot" #Database sensor short name for the Humidity Sensor (will be used by the WebUI to gather an icon from material icons with this name)
     STD_SENSOR_HUM_NAME = "Luftfeuchtigkeit" #Database Sensor Name for the Humidity Sensor (will be prints by the WebUI)
     STD_SENSOR_HUM_TYPE = "%" #Database Sensor Symbol that will be added behind the value in webUI
     STD_SENSOR_TMP_DB_ID = 1 #the same for the temperature sensor
     STD_SENSOR_TMP_SHORTNAME = "wb_sunny"
     STD_SENSOR_TMP_NAME = "Temperatur"
     STD_SENSOR_TMP_TYPE = "°C"
     STD_LOG_PATH = "/var/log/dht22" #not in use yet but specifies the log path for this tool
     STD_DB_PATH = "/opt/climateLog/data.db" #specifies the path of the sqlite database that stores the measures
     STD_DB_MAXRETRY = 5 #max tries to write data into the database. 
     STD_TIME_WAIT_SECONDS = 30`#time between measures
```

If you change the path of the data.db you have to change the path in the remote.php of the webUI too.
#### Webserver
Don't forget to create or change your Webserver configuration. 
Here is a sample apache2 config file:
```ApacheConf
    <VirtualHost *:80>
     ServerName wetter
     DocumentRoot /opt/climateLog/webUI/
     <Directory /opt/climateLog/webUI>
      Order Allow,Deny
      Require all granted
      Allow from all
     </Directory>
     ErrorLog ${APACHE_LOG_DIR}/error.log
     CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>

```

### Run
Always remember that the program needs to be run as root to access the GPIO Port.

A normal user would call the Script with sudo:
    `sudo python3 ./dht22.py`

The root user just can call it without sudo.
    `python3 ./dht22.py` 
    
Please note, that the python command is not necessary if python is in your path variable. And your system knows py files.

The Script can also be run as service (I'd recommend that). 

On systemd just create a file in `/etc/systemd/system` with a [ServiceName].service file name. And insert the following Code:

```INI
     [Unit]
     Description=Service to log climate data with an dht22 sensor.

     [Service]
     ExecStart=[Path to your dht22.py file]/dht22.py
     Restart=always
     RestartSec=3

     [Install]
     WantedBy=multi-user.target
```

Then run the command `systemctl enable [ServiceName].service` to enable this service at boot time (after it reaches multi-user.target, which normally starts when boot reaches the login screen).

And with the command `systemctl start [ServiceName].service` you can start the service after enabling it.
