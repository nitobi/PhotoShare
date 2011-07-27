function onSuccess(imageData) {
  var image = document.getElementById('myImage');
  image.src = "data:image/jpeg;base64,"+imageData;
}
function onFailure(message) {
  alert('Failed because: ' + message);
}
function capturePhoto() {
  navigator.camera.getPicture(onSuccess, onFailure, { quality: 50 });
}
