(function() {
  Ext.define('Rally.test.mock.SnapshotAjaxInterceptor', {
    extend: 'Rally.test.mock.AjaxInterceptor',
    respondWithQueryResult: function(data, options) {
      var response;
      if (data == null) {
        data = [];
      }
      if (options == null) {
        options = {};
      }
      if (!options.url) {
        options.url = '/snapshot/query';
      }
      response = {
        "TotalResultCount": data.length,
        "StartIndex": 1,
        "PageSize": 200,
        "Results": data,
        "Errors": options.errors || [],
        "Warnings": options.warnings || [],
        "ETLDate": options.etlDate || "2011-10-10T12:34:56.789Z"
      };
      return this._mock(response, options.success, options, 'GET');
    }
  });
})();
