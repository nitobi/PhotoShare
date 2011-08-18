// Usage: http://localhost:8080/cf4295e0c2a97f774c0f353519000e11/100x50
var http = require('http');
var fs = require('fs');
var spawn = require('child_process').spawn;

http.createServer(function(req, res) {
  var params = req.url.split('/');

  // Getting image from CouchServer
  var options = {
    host: 'localhost',
    port: 8080,
    path: '/photoshare/'+params[1]+'/original.jpg',
  }

  var imageChunk = '';

  var imageRequest = http.get(options, function(imageResponse) {

//    console.log('STATUS: ' + imageResponse.statusCode);
//    console.log('HEADERS: ' + JSON.stringify(imageResponse.headers));
    imageResponse.setEncoding('binary');
    
    imageResponse.on('data', function (chunk) {
      imageChunk += chunk;
    });
    
    imageResponse.on('end', function() {
      fs.writeFile('image.jpg', imageChunk, 'binary', function(err) {
        if(err) throw err;
        console.log('Converting image with ID '+params[1]+' to resolution of '+params[2]);
        var convert = spawn('convert',  ['image.jpg', '-resize', params[2], '-']);

        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        convert.stdout.pipe(res);
      });
    });

  });
  imageRequest.end();
  fs.unlink('image.jpg');
}).listen(4567);
console.log('Server running at http://127.0.0.1:4567/')
