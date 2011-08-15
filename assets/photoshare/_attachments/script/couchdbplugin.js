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
   },
   update: function(imageDoc, successCallback, failureCallback) {
     $.ajax({
       type: 'PUT',
       url: '/photoshare',
       data: JSON.stringify(imageDoc),
       dataType: 'json',
       contentType: 'application/json',
       success: successCallback,
       error: failureCallback
     });
   },
   fetch: function(imageId, successCallback, failureCallback) {
     $.ajax({
       type: 'GET',
       url: '/photoshare/'+imageId,
       dataType: 'json',
       success: successCallback,
       error: failureCallback
     });
   },
   list: function(successCallback, failureCallback) {
     $.ajax({
       type: 'GET',
       url: '/photoshare/_all_docs',
       dataType: 'json',
       success: successCallback,
       error: failureCallback
     });
   }
}
