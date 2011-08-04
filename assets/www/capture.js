var pictures = document.getElementById("pictures");

function addImage(imageData) {
    var newImg = document.createElement("img");
    newImg.style.width = "120px";
    newImg.style.float = "left";
    newImg.style.padding = "1em";
    newImg.src = "data:image/jpeg;base64,"+imageData;
    newImg.onclick = onImageClick;
    pictures.appendChild(newImg);
}

function toggleButtons() {
  var capture = document.getElementById('capturePhoto');
  var list = document.getElementById('listPhotos');
  if(capture.disabled && list.disabled) {
    capture.disabled = '';
    list.disabled = '';
  } else {
    capture.disabled = 'disabled';
    list.disabled = 'disabled';
  }
}

function setMessage(message) {
  document.getElementById('message').innerHTML = message;
}

function setSyncPoint(syncpoint) {
  document.getElementById('syncpoint').innerHTML = "PhotoShare is in sync with: " + syncpoint;
}

function onStartSuccess(startObj) {
  alert("Success: "+startObj.message);
  CouchDbPlugin.started = true;
  // enabling buttons
  toggleButtons();
  setMessage('');
  setSyncPoint(startObj.syncpoint);
}

function onStartFailure(error) {
  alert("Error: "+error);
}

document.addEventListener("deviceready", function() {
  console.log('initialized');
  PhoneGap.UsePolling = true;
  if(CouchDbPlugin.started == false) {
    setMessage('starting CouchDB');
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
  navigator.camera.getPicture(onCaptureSuccess, onCaptureFailure, { quality: 10 });
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
  toggleButtons();
};
var onListFailure = function(error) {
  alert(error);
  toggleButtons();
};
function listPictures() {
  // resetting the pictures
  toggleButtons();
  pictures.innerHTML = "";
  CouchDbPlugin.list(onListSuccess, onListFailure);
}

function onImageClick() {
  console.log('image clicked !');
  var overlay = document.getElementById('overlay');
  var overlayImage = document.getElementById('overlay-image');
  console.log(this.src);
  overlayImage.src = this.src;
  overlayImage.style.width = "100%";
  console.log(overlayImage.src);
  overlay.style.display = '';
  document.addEventListener('backbutton', backKeyDown, true);
}

function backKeyDown() {
  var overlay = document.getElementById('overlay');
  overlay.style.display = 'none';
  document.removeEventListener('backbutton', backKeyDown, true);
}
