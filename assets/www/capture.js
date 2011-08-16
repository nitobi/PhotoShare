function onStartSuccess(startObj) {
  location.replace(startObj.location);
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
