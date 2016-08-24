<?php
//print_r($_GET);
//print_r($_POST);
if(isset($_GET["action"]))
{
	$action = htmlspecialchars($_GET['action']);
}else{
	printError(2, "no action given.");
	die;
}
$DATABASEFILE = "sensors.db";
global $database;
$database = connectSQLite($DATABASEFILE);
switch ($action) {
	case "current":
		printData(getCurrentVal());
		break;
	default:
		printError(99, "no valid action");
		break;
}



$database = null; //close DB connection
##########################
function printData($JSONdata)
{
	echo $JSONdata;
}
function printError($value, $desc)
{
	$array = array(
				"error" => 1,
				"value" => $value,
				"description" => $desc,
		);
		printData(json_encode($array));
}
function getCurrentVal() {
	$query = "SELECT messungen.id, messungen.timestamp, messungen.comment, data.value, sensor.name AS sensor, sensor.type, sensor.shortname FROM messungen INNER JOIN data ON messungen.id = data.fk_messungen INNER JOIN sensor ON data.fk_sensor = sensor.id WHERE messungen.id = (SELECT MAX(messungen.id) FROM messungen)";
	$data = sql_query($query);
	//print_r($data);
	//print_r($row);
	$i = 0;
	foreach($data as $row)
	{
		$messure[$i]['sensor'] = $row['sensor'];
		$messure[$i]['value'] = $row['value'];
		$messure[$i]['type'] = $row['type'];
		$messure[$i]['shortname'] = $row['shortname'];
		$i++;
	};
	$array = array(
		"id" => $data[0]['id'],
		"timestamp" => $data[0]['timestamp'],
		"comment" => $data[0]['comment'],
		"messures" => $messure,
	);
	printData(json_encode($array));
}
function connectSQLite($path)
{
	if (!$db = new PDO("sqlite:$path")) {
		printError(2, "cannot connect DB: ".$db->errorInfo());
        die;
    }
    return $db; 
}
function sql_query($query)
{
	global $database;
	$result = $database->query($query);
	if(!$result){
		printError(2, "error on query data: ".$database->errorInfo());
        die;
	}
	while($row = $result->fetch(PDO::FETCH_ASSOC))
	{
		$data[] = $row;
	}
	return $data;
}
?>