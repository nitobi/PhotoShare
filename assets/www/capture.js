function onStartSuccess(startObj) {
  alert("Success: "+startObj.message);
  document.location = startObj.location;
  CouchDbPlugin.started = true;
}

function onStartFailure(error) {
  alert("Error: "+error);
}

document.addEventListener("deviceready", function() {
  PhoneGap.UsePolling = true;
  if(CouchDbPlugin.started == false) {
    CouchDbPlugin.start(onStartSuccess, onStartFailure);
  }
}, true);
