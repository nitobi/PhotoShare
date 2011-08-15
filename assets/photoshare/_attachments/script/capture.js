// Use PhoneGap polling because of cross-origin&speed problem when loading from couchDB
PhoneGap.UsePolling = true;

var selectedPictureId = null;

// Helper Methods

function addImage(imageId) {
    var newImg = $("<img></img>")
                 .addClass('thumbnail')
                 .css('width', '60px')
                 .css('float', 'left')
                 .css('padding', '2px')
                 .attr({id: imageId,
                        src: '/photoshare/'+imageId+'/original.jpg'
                       });
    newImg.click(onImageClick);
    $('#pictures').append(newImg);
}

function toggleButton() {
  var capture = $('#capturePhoto');
  if(capture.attr('disabled')) {
    capture.removeAttr('disabled');
  } else {
    capture.attr('disabled', true);
  }
}

function setMessage(message) {
  $('#message').html(message);
}

// Syncpoint

function onSyncPointSuccess(syncpoint) {
  $('#syncpoint').html("PhotoShare is in sync with: " + syncpoint);
  toggleButton();
  listPictures();
}

function onSyncPointFailure(error) {
  alert("onSyncPointFailure "+error);
}

var started = false;
function startApp() {
    if (started) return;
    started = true;
    console.log('initialized');
    listPictures();
    CouchDbPlugin.getSyncPoint(onSyncPointSuccess, onSyncPointFailure); 
};

document.addEventListener("deviceready", startApp, true);
document.addEventListener("load", startApp, true);

// Capture

function onCaptureSuccess(imageData) {
  var onSaveSuccess = function(imageDoc) {
    addImage(imageDoc.id);
    setMessage('');
  };
  var onSaveFailure = function(xhr, type) {
    alert("onSaveFailure "+type + ' ' + xhr.responseText);
  };
  setMessage('Saving image...');
  var imageDoc = {
    "comments": ['First Comment'],
    "_attachments": {
      "original.jpg": {
        "content-type": "image/jpeg",
        "data": imageData
      }
  }};
  CouchDbPlugin.save(imageDoc, onSaveSuccess, onSaveFailure);
}

function onCaptureFailure(message) {
  alert('onCaptureFailure ' + message);
}

function capturePhoto() {
  navigator.camera.getPicture(onCaptureSuccess, onCaptureFailure, { quality: 10 });
}

// List

function onListSuccess(dbObj) {
  if(dbObj.total_rows == 0) {
    $('#pictures').html("<p>No pictures in the DB</p>");
  }
  else {
    // FIXME: there should be a better way to skip _design/photoshare doc
    setMessage('Fetching images from the DB...');
    for(var i = 0, j = dbObj.total_rows ; i < j ; i++) {
      if(dbObj.rows[i].id != '_design/photoshare') {
        addImage(dbObj.rows[i].id);
      }
    }
    setMessage('');
  }
  toggleButton();
};
var onListFailure = function(xhr, error) {
  alert("onListFailure " +error);
  toggleButton();
};
function listPictures() {
  // resetting the pictures
  toggleButton();
  $('#pictures').html("");
  $.ajax({
    type: 'GET',
    url: '/photoshare/_all_docs',
    dataType: 'json',
    success: onListSuccess,
    error: onListFailure
  });
}

function sendComment() {
  // TODO: save comment in the db
    $('#comments').prepend('<p>'+$('#comment-area').val()+'</p>');
}

function onImageClick() {
  selectedPictureId = this.id;
  $('#photoview-image').attr('src', this.src).css('width', '100%');
  $('#photoview').css("-webkit-transform","translate(0,0)");
  $('#photoview').show();
  $('#main').hide();
  $('#send-comment').click(sendComment);
  document.addEventListener('backbutton', backKeyDown, true);
}

function backKeyDown() {
  document.removeEventListener('backbutton', backKeyDown, true);
  $('#send-comment').unbind('click');
  $('#photoview').css("-webkit-transform","translate(100%,0)");
  $('#photoview').hide();
  $('#main').show();
}

