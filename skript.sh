#!/bin/bash
DHTEXEC="/usr/local/bin/lol_dht22"
DHTEXECPARAM="7"
LOGFILE="/var/log/sensors.log"
DBFILE="/usr/local/share/webUI/sensors.db"
SQLITE="/usr/bin/sqlite3"
MAXTRIES=5
while true
do
	IN=$($DHTEXEC $DHTEXECPARAM)
	if [ $? -ne 0 ]; then
		echo "Failed to get Data" >> $LOGFILE
		exit 9
	fi
	IFS=\; read -a fields <<<"$IN"
	success=0
	insert1=0
	insert2=0
	insert3=0
	tries=0
	while (( $success == 0 && $tries <= $MAXTRIES ))
	do
		(( tries++ ))
		if [ $insert1 -eq 0 ]; then
			echo "schreibe Messung"
			$SQLITE $DBFILE "INSERT INTO messungen(timestamp) VALUES (\"${fields[0]}\");"
			if [ $? -ne 0 ]; then
				echo "Failed write measure. ${SQLITE} ${DBFILE} \"INSERT INTO messungen(timestamp) VALUES (${fields[0]});\"" >> $LOGFILE
				continue
			fi
			insert1=1
		fi
		MESSID=$($SQLITE $DBFILE "SELECT id FROM messungen WHERE timestamp = \"${fields[0]}\";")
		if [ $insert2 -eq 0 ]; then
			echo "schreibe Luftfeuchtigkeit"
			$SQLITE $DBFILE "INSERT INTO data(fk_messungen, fk_sensor, value) VALUES (${MESSID}, 2, ${fields[1]});"
			if [ $? -ne 0 ]; then
				echo "Failed to write humidity. $SQLITE $DBFILE \"INSERT INTO data(fk_messungen, fk_sensor, value) VALUES (${MESSID}, 2, ${fields[1]});\"" >> $LOGFILE
				continue
			fi
			insert2=1
		fi
		if [ $insert3 -eq 0 ]; then
			echo "schreibe Temperatur"
			$SQLITE $DBFILE "INSERT INTO data(fk_messungen, fk_sensor, value) VALUES (${MESSID}, 1, ${fields[2]});"
			if [ $? -ne 0 ]; then
				echo "Failed to write temperature. $SQLITE $DBFILE \"INSERT INTO data(fk_messungen, fk_sensor, value) VALUES (${MESSID}, 1, ${fields[2]});\"" >> $LOGFILE
				continue
			fi
			insert3=1
		fi
		if (( $insert1 == 1 && $insert2 == 1 && $insert3 == 1 )); then
			success=1
			echo "alles Erfolgreich"
		fi
	done
	sleep 60
done
exit 0
