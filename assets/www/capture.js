var pictures = document.getElementById("pictures");

function addImage(imageData) {
    var newImg = document.createElement("img");
    newImg.style.width = "120px";
    newImg.style.float = "left";
    newImg.style.padding = "1em";
    newImg.src = "data:image/jpeg;base64,"+imageData;
    pictures.appendChild(newImg);
}

function setMessage(message) {
  document.getElementById('message').innerHTML = message;
}

function onStartSuccess(message) {
  alert("Success: "+message);
  CouchDbPlugin.started = true;
  // enabling buttons
  document.getElementById('capturePhoto').disabled = '';
  document.getElementById('listPhotos').disabled = '';
  setMessage('');
}

function onStartFailure(error) {
  alert("Error: "+error);
}

document.addEventListener("deviceready", function() {
  console.log('initialized');
  PhoneGap.UsePolling = true;
  if(CouchDbPlugin.started == false) {
    CouchDbPlugin.start(onStartSuccess, onStartFailure);
  }
}, true);

function onCaptureSuccess(imageData) {
  var success = function(response) {
    alert(response);
    setMessage('');
    addImage(imageData);
  };
  var failure = function(error) {
    alert(error);
  };
  setMessage('Saving image...');
  CouchDbPlugin.save({imageData: imageData}, success, failure);
}

function onCaptureFailure(message) {
  alert('Failed because: ' + message);
}

function capturePhoto() {
  navigator.camera.getPicture(onCaptureSuccess, onCaptureFailure, { quality: 50 });
}

function onListSuccess(data) {
  var dbObj = JSON.parse(data);
  var onFetchSuccess = function(image) {
    setMessage('');
    // updating DOM
    console.log(image);
    // adding image to existing listing
    addImage(JSON.parse(image).imageData);
  }
  var onFetchFailure = function(error) {
    setMessage(error);
    console.log('Failure while fetching image');
  }

  if(dbObj.total_rows == 0) {
    pictures.innerHTML = "<p>No pictures in the DB</p>";
  }
  else {
    for(var i = 0, j = dbObj.total_rows ; i < j ; i++) {
      setMessage('Fetching images from the DB...');
      CouchDbPlugin.fetch(dbObj.rows[i].id, onFetchSuccess, onFetchFailure);
    }
  }
};
var onListFailure = function(error) {
  alert(error);
};
function listPictures() {
  // resetting the pictures
  pictures.innerHTML = "";
  CouchDbPlugin.list(onListSuccess, onListFailure);
}
