var CouchDbPlugin = {
   started: false,
   start: function(successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'start',
                          []
                         );
   },
   list: function(successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'list',
                          []
                         );
   },
   fetch: function(id, successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'fetch',
                          [id]
                         );
   },
   save: function(data, successCallback, failureCallback) {
     return PhoneGap.exec(successCallback,
                          failureCallback,
                          'CouchDbPlugin',
                          'save',
                          [data]
                         );
   }
}
