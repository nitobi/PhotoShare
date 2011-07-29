var CouchDbPlugin = {
   started: false,
   // TODO: gotta find a better way to do this
   installStatus: function(completed, total) {
     var progress = Math.round((completed * 100) / total);
     setMessage("Installing CouchDB: "+progress+"%");
   },
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
