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
    $('#pictures').prepend(newImg);
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



var since = 0;
function changesCallback(opts) {
  since = opts.last_seq || since;
  onDBChange(opts);
  $.ajax({
    type: 'GET',
    url: '/photoshare/_changes?feed=longpoll&since='+since,
    dataType: 'json',
    success: changesCallback,
    error: function() {
      setTimeout(function() {
        console.log("error changes");
        console.log(opts);
        changesCallback({last_seq : since});
      }, 250)
    }
  });
}


function setupChanges() {
  changesCallback({last_seq : 0});
}

function onDBChange(opts) {
  // append new pictures to the view without disturbing old ones
  listPictures(opts);
}

function listPictures(data) {
  if (data.results) {
    for (var i = 0; i < data.results.length; i++){
      if(!data.results[i].deleted && data.results[i].id.indexOf('_design/') != 0) {
        addImage(data.results[i].id);
      }
    }
  }
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

function startCamera() {
  var capture = $('#capturePhoto');
  capture.removeAttr('disabled');
}


function start() {
    // setup listing of pictures and auto refresh
    setupChanges();
    setupSync();
}

var started = false;
function startApp() {
    if (started) return;
    started = true;
    start();
};

document.addEventListener("deviceready", startCamera, true);
$('body').ready(startApp);
