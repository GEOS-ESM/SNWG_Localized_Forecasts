$(".onoff_buton").on( "click", function() {
});
function push_notif(spot,resource){

	$('.'+spot).load("controllers/fetch.php?resource="+resource);
	}		   
	
function update_json(spot,resource){

	$('.'+spot).load("controllers/fetch.php?resource="+resource);
	alert("controllers/fetch.php?resource="+resource);
	}
	
