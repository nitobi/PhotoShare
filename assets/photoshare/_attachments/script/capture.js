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
    // capture.attr('disabled', true);
  }
}

function setMessage(message) {
  $('#message').html(message);
}

// Syncpoint

function setupSync() {
    var syncpoint = "http://couchbase.ic.ht/photoshare";
    $.ajax({
      type: 'POST',
      url: '/_replicate',
      data: JSON.stringify({
          source : syncpoint,
          target : "photoshare"
      }),
      dataType: 'json',
      contentType: 'application/json'
    });
    $.ajax({
      type: 'POST',
      url: '/_replicate',
      data: JSON.stringify({
          target : syncpoint,
          source : "photoshare"
      }),
      dataType: 'json',
      contentType: 'application/json'
    });
}



// Capture

function onCaptureSuccess(imageData) {
  console.log("onCaptureSuccess");
  var onSaveSuccess = function(imageDoc) {
    addImage(imageDoc.id);
    setMessage('');
  };
  var onSaveFailure = function(xhr, type) {
    alert("onSaveFailure "+type + ' ' + xhr.responseText);
  };
  setMessage('Saving image...');
  var imageDoc = {
    created_at: new Date(),
    _attachments: {
      "original.jpg": {
        content_type: "image/jpeg",
        data: imageData
      }
  }};
  $.ajax({
    type: 'POST',
    url: '/photoshare',
    data: JSON.stringify(imageDoc),
    dataType: 'json',
    contentType: 'application/json',
    success: onSaveSuccess,
    error: onSaveFailure
  });
}

function onCaptureFailure(message) {
  alert('onCaptureFailure ' + message);
}

function capturePhoto() {
  console.log("capturePhoto");
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

function changesCallback(opts) {
  onDBChange();
  $.ajax({
    type: 'GET',
    url: '/photoshare/_changes?feed=longpoll&since='+opts.last_seq,
    dataType: 'json',
    success: setupChanges,
    error: function() {alert("error with changes")}
  });
}


function setupChanges() {
  $.ajax({
    type: 'GET',
    url: '/photoshare',
    dataType: 'json',
    success: function(resp) {
      changesCallback({last_seq : resp.update_seq});
    },
    error: function() {alert("error with changes")}
  });

}

function onDBChange() {
  listPictures();
}


function listPictures() {
  // resetting the pictures
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

function start() {
    // setup listing of pictures and auto refresh
    setupChanges();
    setupSync();
    toggleButton();
}

var started = false;
function startApp() {
    if (started) return;
    started = true;
    start();
};

document.addEventListener("deviceready", startApp, true);
document.addEventListener("load", startApp, true);
$('body').ready(startApp);
