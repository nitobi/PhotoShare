var CouchDbPlugin = {
   started: false,
   getSyncPoint: function(successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'getSyncPoint',
                          []
                         );
   },
   save: function(imageDoc, successCallback, failureCallback) {
     $.ajax({
       type: 'POST',
       url: '/photoshare',
       data: JSON.stringify(imageDoc),
       dataType: 'json',
       contentType: 'application/json',
       success: successCallback,
       error: failureCallback
     });
   }
}
