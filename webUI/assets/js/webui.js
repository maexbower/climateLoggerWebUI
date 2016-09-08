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
function updateCurrentValues(response)
{
	if(!response)
	{
		showError("Missing Data");
		return -1;
	}
	var data = jQuery.parseJSON(response.responseText);
	var row = document.createElement('div');
	row.className = "row";
	row.setAttribute("id", "currentValuesRow");
	for(sensor of data.messures)
	{
		var card = document.createElement('div');
		card.className = "card col s6";
		var cardImage = document.createElement('div');
		cardImage.className = "card-image center";
		var image = document.createElement('i');
		image.className = "material-icons large";	
		image.textContent = sensor.shortname;
		var cardText = document.createElement('div');
		cardText.className = "card-content center";
		var text = document.createElement('p');
		text.innerHTML = data.timestamp + "<br />"+ sensor.sensor + ":" + sensor.value + sensor.type;
		cardImage.appendChild(image);
		cardText.appendChild(text);
		card.appendChild(cardImage);
		card.appendChild(cardText);
		row.appendChild(card);
	}
	if(document.getElementById("currentValuesRow"))
	{
		$('#vlaueContainer')[0].replaceChild(row, $('#currentValuesRow')[0]);
	}else{
		$('#vlaueContainer').append(row);
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
	var JSONData = queryText;
    switch(action){
        //Einträge Anlegen
        case "current":
            type = "GET";
            break;
        default:
            showError("interner Fehler, falsche Action ID:"+action);
            return;
            break;
    }

    var url="./remote.php?action="+action;
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
