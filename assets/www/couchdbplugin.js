var CouchDbPlugin = {
   started: false,
   start: function(successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'start',
                          []
                         );
   }
};
