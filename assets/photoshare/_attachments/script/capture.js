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

function addComment(commentDoc) {
  $('#comments').prepend('<span>'+commentDoc.comment+'</span><br/>')
                .prepend('<span class="author">'+commentDoc.author+' wrote:</span> ');
}

function clearPhotoView() {
  $('#comments').html('');
  $('#photoview-image').attr('src', '');
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
  alert(error);
}

document.addEventListener("deviceready", function() {
  console.log('initialized');
  CouchDbPlugin.getSyncPoint(onSyncPointSuccess, onSyncPointFailure);
}, true);

// Capture

function onCaptureSuccess(imageData) {
  var onSaveSuccess = function(imageDoc) {
    addImage(imageDoc.id);
    setMessage('');
  };
  var onSaveFailure = function(xhr, type) {
    alert(type + ' ' + xhr.responseText);
  };
  setMessage('Saving image...');
  var imageDoc = {
    "type": "photo",
    "_attachments": {
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
    $('#pictures').html("<p>No pictures in the DB</p>");
  }
  else {
    // FIXME: there should be a better way to skip _design/photoshare doc
    setMessage('Fetching images from the DB...');
    for(var i = 0, j = dbObj.total_rows ; i < j ; i++) {
      addImage(dbObj.rows[i].id);
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
  $('#pictures').html("");
  $.ajax({
   type: 'GET',
   url: '/photoshare/_design/photoshare/_view/photos',
   dataType: 'json',
   success: onListSuccess,
   error: onListFailure 
  });
}

function sendComment() {
    var commentDoc = {
      "type": "comment",
      "photo": selectedPictureId,
      "author": $('#comment-author').val(),
      "comment": $('#comment-text').val()
    };

    var onCommentSuccess = function(response) {
      addComment(commentDoc);
    };

    var onCommentFailure = function(xhr, type) {
      alert(type + ' ' + xhr.responseText);
    };

    CouchDbPlugin.save(commentDoc, onCommentSuccess, onCommentFailure);
}

function onImageClick() {
  // FIXME: maybe use a hidden field instead?
  selectedPictureId = this.id;
  $('#photoview-image').attr('src', this.src)
                       .css('width', '100%');
  $('#photoview').css("-webkit-transform","translate(0,0)");

  var onFetchSuccess = function(response) {
    console.log(JSON.stringify(response));
    for(var i = 0 , j = response.total_rows - response.offset ; i < j ; i++) {
      addComment(response.rows[i].value);
    }
    $('#photoview').show();
    $('#main').hide();
    $('#send-comment').click(sendComment);
    document.addEventListener('backbutton', backKeyDown, true);
  };

  var onFetchFailure = function(xhr, type) {
    console.log(type + ' ' + xhr.responseText);
  }

  $.ajax({
   type: 'GET',
   url: '/photoshare/_design/photoshare/_view/photo_and_comments?startkey=["'+selectedPictureId+'",1]',
   dataType: 'json',
   contentType: 'application/json',
   success: onFetchSuccess,
   error: onFetchFailure
  });
}

function backKeyDown() {
  document.removeEventListener('backbutton', backKeyDown, true);
  $('#send-comment').unbind('click');
  $('#photoview').css("-webkit-transform","translate(100%,0)");
  $('#photoview').hide();
  clearPhotoView();
  $('#main').show();
}

