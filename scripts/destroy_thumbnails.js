var nano = require('nano')('http://localhost:8080'); // TODO change this to real server
var photoshare = nano.use('photoshare')

photoshare.list(function(_,_,doc) {
  for(var i = 0, j = doc.total_rows ; i < j ; i++) {
    console.log(doc.rows[i]);
    photoshare.attachment.destroy(doc.rows[i].id, 'thumbnail.jpg', doc.rows[i].value.rev, function(_,_,d) {
      console.log('Destroyed ', d);
    });
  }
});
