// Use PhoneGap polling because of cross-origin&speed problem when loading from couchDB
PhoneGap.UsePolling = true;

var pictures = document.getElementById("pictures");

// Helper Methods

function addImage(imageSrc) {
    var newImg = document.createElement("img");
    newImg.style.width = "120px";
    newImg.style.float = "left";
    newImg.style.padding = "1em";
    newImg.src = imageSrc;
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

// Syncpoint

function onSyncPointSuccess(syncpoint) {
  document.getElementById('syncpoint').innerHTML = "PhotoShare is in sync with: " + syncpoint;
  toggleButtons();
  listPictures();
}

function onSyncPointFailure(error) {
  alert(error);
}

document.addEventListener("deviceready", function() {
  console.log('initialized');
  CouchDbPlugin.getSyncPoint(onSyncPointSuccess, onSyncPointFailure);
}, true);

// Capture

function onCaptureSuccess(imageData) {
  var onSaveSuccess = function(imageDoc) {
    addImage('/photoshare/'+imageDoc.id+'/original.jpg');
    setMessage('');
  };
  var onSaveFailure = function(xhr, type) {
    alert(type + ' ' + xhr.responseText);
  };
  setMessage('Saving image...');
  var imageDoc = {"_attachments": {
    "original.jpg": {
      "content-type": "image/jpeg",
      "data": imageData
    }
  }};
  CouchDbPlugin.save(imageDoc, onSaveSuccess, onSaveFailure);
}

function onCaptureFailure(message) {
  alert('Failed because: ' + message);
}

function capturePhoto() {
  navigator.camera.getPicture(onCaptureSuccess, onCaptureFailure, { quality: 10 });
}

// List

function onListSuccess(dbObj) {
  if(dbObj.total_rows == 0) {
    pictures.innerHTML = "<p>No pictures in the DB</p>";
  }
  else {
    // FIXME: there should be a better way to skip _design/photoshare doc
    setMessage('Fetching images from the DB...');
    for(var i = 0, j = dbObj.total_rows - 1 ; i < j ; i++) {
      addImage('/photoshare/'+dbObj.rows[i].id+'/original.jpg');
    }
    setMessage('');
  }
  toggleButtons();
};
var onListFailure = function(xhr, error) {
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
