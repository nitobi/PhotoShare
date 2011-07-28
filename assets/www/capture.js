document.addEventListener("deviceready", function() {
    console.log('initialized');
    var success = function(message) {
      CouchDbPlugin.started = true;
      alert("Success: "+message);
    }
    var error = function(error) {
      alert("Error: "+error);
    }
    CouchDbPlugin.start(success, error);
}, true);

function onCaptureSuccess(imageData) {
  var image = document.getElementById('myImage');
  image.src = "data:image/jpeg;base64,"+imageData;
  var success = function(response) {
    alert(response);
  };
  var failure = function(error) {
    alert(error);
  };
  CouchDbPlugin.save({imageData: imageData}, success, failure);
}

function onCaptureFailure(message) {
  alert('Failed because: ' + message);
}

function capturePhoto() {
  navigator.camera.getPicture(onCaptureSuccess, onCaptureFailure, { quality: 50 });
}

var pictures = document.getElementById("pictures");

function onListSuccess(data) {
  var dbObj = JSON.parse(data);
  var onFetchSuccess = function(image) {
    // updating DOM
    console.log(image);
    var imageObj = JSON.parse(image);
    // adding image to existing listing
    var newImg = document.createElement("img");
    newImg.style.width = "120px";
    newImg.style.float = "left";
    newImg.style.padding = "1em";
    newImg.src = "data:image/jpeg;base64,"+imageObj.imageData;
    pictures.appendChild(newImg);
  }
  var onFetchFailure = function(error) {
    console.log('Failure while fetching image');
  }

  if(dbObj.total_rows == 0) {
    pictures.innerHTML = "<p>No pictures in the DB</p>";
  }
  else {
    for(var i = 0, j = dbObj.total_rows ; i < j ; i++) {
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
