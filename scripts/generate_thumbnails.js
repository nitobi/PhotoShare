var follow = require('./follow');
var nano = require('nano')('http://localhost:8080'); // TODO change this to real server
var photoshare = nano.use('photoshare')
var fs = require('fs');
var spawn = require('child_process').spawn;

follow("http://localhost:8080/photoshare", function(error, change) {
  if(!error) {
    console.log("Got change number " + change.seq + ": " + change.id);
    var original = change.id+'.jpg';
    photoshare.get(change.id, {}, function(_,_,doc) {
      if(doc['_attachments']
         && doc['_attachments']['original.jpg']
         && !doc['_attachments']['thumbnail.jpg']
        ) {
        // writing original.jpg to local fs
        var thumb_st = fs.createWriteStream(original, {encoding:'binary'});
        thumb_st.on("close", function() {
          console.log("Converting "+original+" to thumb_"+original);
          // resizing the image
          var convert = spawn('convert',  [original, '-resize', '100x50', '-']);
          convert.stdout.pipe(photoshare.attachment.insert(change.id, 'thumbnail.jpg', {}, "image/jpeg", {rev: doc._rev}));
          //convert.stdout.pipe(fs.createWriteStream("thumb_"+original));
          convert.stdout.on("end", function() {
            fs.unlink(original);
          });
        });
        photoshare.attachment.get(change.id, 'original.jpg').pipe(thumb_st);
      }
    });
  }
});
