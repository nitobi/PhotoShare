var CouchDbPlugin = {
   started: false,
   getSyncPoint: function(successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'getSyncPoint',
                          []
                         );
   }
}
