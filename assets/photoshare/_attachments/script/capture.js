// Use PhoneGap polling because of cross-origin&speed problem when loading from couchDB
PhoneGap.UsePolling = true;

var pictures = document.getElementById("pictures");

// Helper Methods

function addImage(imageSrc) {
    var newImg = document.createElement("img");
    newImg.style.width = "60px";
    newImg.style.float = "left";
    newImg.style.padding = "2px";
    newImg.src = imageSrc;
    newImg.onclick = onImageClick;
    pictures.appendChild(newImg);
}

function toggleButton() {
  var capture = document.getElementById('capturePhoto');
  if(capture.disabled) {
    capture.disabled = '';
  } else {
    capture.disabled = 'disabled';
  }
}

function setMessage(message) {
  document.getElementById('message').innerHTML = message;
}

// Syncpoint

function onSyncPointSuccess(syncpoint) {
  document.getElementById('syncpoint').innerHTML = "PhotoShare is in sync with: " + syncpoint;
  toggleButton();
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
    for(var i = 0, j = dbObj.total_rows ; i < j ; i++) {
      if(dbObj.rows[i].id != '_design/photoshare')
        addImage('/photoshare/'+dbObj.rows[i].id+'/original.jpg');
    }
    setMessage('');
  }
  toggleButton();
};
var onListFailure = function(xhr, error) {
  alert(error);
  toggleButton();
};
function listPictures() {
  // resetting the pictures
  toggleButton();
  pictures.innerHTML = "";
  CouchDbPlugin.list(onListSuccess, onListFailure);
}

function sendComment() {
  // TODO: save comment in the db
  try {
    $('#comments').prepend('<p>'+$('#comment-area').val()+'</p>');
  } catch(e) {
    alert(e.message);
  }
}

function onImageClick() {
  var photoviewImage = document.getElementById('photoview-image');
  photoviewImage.src = this.src;
  photoviewImage.style.width = "100%";
  document.addEventListener('backbutton', backKeyDown, true);
  $('#send-comment').click(sendComment);
  $('#photoview').css("-webkit-transform","translate(0,0)");
  $('#main').hide();
}

function backKeyDown() {
  var photoview = document.getElementById('photoview');
  document.removeEventListener('backbutton', backKeyDown, true);
  $('#send-comment').unbind('click');
  $('#photoview').css("-webkit-transform","translate(100%,0)");
  $('#main').show();
}

