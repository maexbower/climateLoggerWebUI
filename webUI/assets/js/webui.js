function showError(Message)
{
   Materialize.toast("Fehler: "+Message, 1000, 'toastErrorClass');
}
function showSuccess(Message)
{
    Materialize.toast(Message, 1000, 'toastSuccessClass');
}
function showDebug(Message)
{
	//Materialize.toast("DEBUG:"+Message, 1000, 'toastDebugClass');
	//console.log("DEBUG:"+Message);
}
function getCurrentValues()
{
	ajaxQuery("current");
}
function getHistory(sensorName)
{
	ajaxQuery("history","",sensorName);
}
function showLoadingAnimation(onoff)
{
	var html = '<div class="progress" id="MyLoader">' +
				'<div class="indeterminate"></div>' +
				'</div>';
	if(onoff == true)
	{
		$("div.navbar-fixed").append(html);
	}else{
		$("#MyLoader").remove();
	}
}
function createSensorCard(sensor, data)
{
    var card = document.createElement('div');
    card.className = "card col m6 s12";
    card.id = "card_"+sensor.shortname;
    var cardImage = document.createElement('div');
    cardImage.className = "card-content center";
    var image = document.createElement('i');
    image.className = "material-icons large";
    image.textContent = sensor.shortname;
    cardImage.appendChild(image);
    card.appendChild(cardImage);
    var cardTabs = document.createElement('div');
    cardTabs.className = "card-tabs";
    var cardTabsUl = document.createElement('ul');
    cardTabsUl.className = "tabs tabs-fixed-width";
    var cardTabsCurrentVal = document.createElement('li');
    cardTabsCurrentVal.className = "tab";
    var cardTabsCurrentValLink = document.createElement('a');
    cardTabsCurrentValLink.className = "active";
    cardTabsCurrentValLink.href = "#"+sensor.shortname+"_current";
    cardTabsCurrentValLink.textContent = "Aktuell";
    cardTabsCurrentVal.appendChild(cardTabsCurrentValLink);
    cardTabsUl.appendChild(cardTabsCurrentVal);
    var cardTabsHistory = document.createElement('li');
    cardTabsHistory.className = "tab";
    cardTabsHistory.addEventListener('click', function(){getHistory(sensor.shortname);});
    var cardTabsHistoryLink = document.createElement('a');
    cardTabsHistoryLink.href = "#"+sensor.shortname+"_history";
    cardTabsHistoryLink.textContent = "Historie";
    cardTabsHistory.appendChild(cardTabsHistoryLink);
    cardTabsUl.appendChild(cardTabsHistory);
    cardTabs.appendChild(cardTabsUl);
    card.appendChild(cardTabs);
    var cardText = document.createElement('div');
    cardText.className = "card-content center";
    var cardTextAktuell = document.createElement('div');
    cardTextAktuell.id = sensor.shortname+"_current";
    var textAktuell = document.createElement('div');
    textAktuell.id = sensor.shortname+"_currentText";
    textAktuell.innerHTML = "<p>"+data.timestamp + "<br />"+ sensor.sensor + ":" + sensor.value + sensor.type+"</p>";
    cardTextAktuell.appendChild(textAktuell);
    cardText.appendChild(cardTextAktuell);
    var cardTextHistorie = document.createElement('div');
    cardTextHistorie.id = sensor.shortname+"_history";
    var historie = document.createElement('div');
    historie.id = sensor.shortname+"graphparent";
    historie.innerHTML = "<p>empty</p>";
    cardTextHistorie.appendChild(historie);
    cardText.appendChild(cardTextHistorie);
    card.appendChild(cardText);
    return card;
}
function updateCurrentValues(response)
{
	if(!response)
	{
		showError("Missing Data");
		return -1;
	}
	var data = jQuery.parseJSON(response.responseText);
    var row = document.getElementById("currentValuesRow");
    if(row)
    {
        for(sensor of data.messures)
        {
        	var sensorCard = document.getElementById("card_"+sensor.shortname);
        	if(sensorCard)
        	{
				document.getElementById(sensor.shortname+"_currentText").innerHTML = "<p>"+data.timestamp + "<br />"+ sensor.sensor + ":" + sensor.value + sensor.type+"</p>";
            }else {
				row.appendChild(createSensorCard(sensor, data));
            }
        }

    }else{
        var row = document.createElement('div');
        row.className = "row";
        row.setAttribute("id", "currentValuesRow");
        for(sensor of data.messures)
        {
            row.appendChild(createSensorCard(sensor, data));
        }
        $('#vlaueContainer').append(row);
    }
    init();
}
function updateHistory(response) {
    if (!response) {
        showError("Missing Data");
        return -1;
    }
    var data = jQuery.parseJSON(response.responseText);
    var sensor = data.sensor;
    var shortname = data.shortname;
    var type = data.type;
    var graphcontainer = document.createElement('div');
    	graphcontainer.id = "graph_"+shortname;
    	graphcontainer.class = "sensorgraph";
	var graphparent = document.getElementById(shortname+"graphparent");
	var dataline = [];
	var maxval = 0;
	for(set of data.messures)
	{
		if(maxval < set.value)
		{
			maxval = set.value;
		}
        dataline.push([set.timestamp,set.value]);
	}


	if(graphparent)
	{
        graphparent.innerHTML = "";
        graphparent.appendChild(graphcontainer);
        showDebug(dataline);
        var opts = {
            title:data.sensor,
            axes:{
                xaxis:{
                    renderer: $.jqplot.DateAxisRenderer,
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                    tickInterval: "20 minutes",
                    tickOptions:{
                        formatString:'%H:%M',
                        angle:-45
                    }
                },
                yaxis:{
                    max: maxval+1,
                    tickOptions:{
                        formatString:"%.2f"+data.type
                    }
                }
            },
            highlighter: {
                useAxesFormatters: true,
                tooltipAxes: 'both',
				show: true

            }
        };
        var plots = [];
        plots.push($.jqplot(graphcontainer.id, [dataline], opts));
	}
}
function ajaxError(response)
{
	showLoadingAnimation(false);
	if(response.responseText == null)
	{
		showError("Abrufen fehlgeschlagen. Keine Verbindung.");
		return;
	}
	var data = jQuery.parseJSON(response.responseText);
    showError(data.description);

}
function ajaxSuccess(response, action)
{
	showLoadingAnimation(false);
    showDebug("ajaxSuccess: Action="+action);
    showDebug("Response="+response.responseText);
    switch(action){
        case "current":
			/*showDebug("Daten erfolgreich abgerufen");*/
			updateCurrentValues(response);
            break;
        case "history":
			/*showDebug("Daten erfolgreich abgerufen");*/
            updateHistory(response);
            break;
        default:
            showError("interner Fehler, falsche Action ID:"+action);
            return;
            break;
    }
}
function ajaxQuery(action, queryText, optParam)
{
	showLoadingAnimation(true);
    showDebug('Create Ajax Query{"action":"'+action+'","queryText":"'+queryText+'","optParam":"'+optParam+'"}');
    var type = "";
    if(queryText != "")
	{
        var JSONData = queryText;
	}
    var JSONData;
    switch(action){
        //Einträge Anlegen
        case "current":
            type = "GET";
            break;
		case "history":
			type = "GET";
			optParam = "sensor="+optParam;
            break;
        default:
            showError("interner Fehler, falsche Action ID:"+action);
            showLoadingAnimation(false);
            return;
            break;
    }

    var url="./remote.php?action="+action+"&"+optParam;
	showDebug('Send the following Data{"url":"'+url+'","type":"'+type+'","data":"'+JSON.stringify(JSONData)+'"}');
    $.ajax({
        url: url,
        type: type,
		contentType: "application/json",
        dataType: "json",
		//cache: false, //produziert, warum auch immer Fehler...
        data: JSON.stringify(JSONData),
        error: function(jqXHR, textStatus, errorThrown){ ajaxError(jqXHR); },
        success: function(data, textStatus, jqXHR){ ajaxSuccess(jqXHR, action); }
    });


}
function init()
{
	$('.datepicker').pickadate({
		selectMonths: true, // Creates a dropdown to control month
		selectYears: 15, // Creates a dropdown of 15 years to control year
		firstDay: 1,
		format: 'dd.mm.yyyy',
		formatSubmit: 'dd.mm.yyyy'
	});
	$('select').material_select();
    $('ul.tabs').tabs();
    //$.jqplot.config.enablePlugins = true;
}
(function($){

  $(function(){
	getCurrentValues();
	init();
    //$('.button-collapse').sideNav();
    $('.collapsible').collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
	window.setInterval(function(){
		getCurrentValues();
	}, 30000);
  }); // end of document ready
})(jQuery); // end of jQuery name space
