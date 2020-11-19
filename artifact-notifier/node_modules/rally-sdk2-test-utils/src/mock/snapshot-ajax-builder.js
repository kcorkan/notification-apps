(function() {
  Ext.define('Rally.test.mock.SnapshotAjaxBuilder', {
    whenQueryingLookbackApi: function() {
      return this._whenLookback('query');
    },
    _whenLookback: function(verb) {
      var builder;
      builder = Ext.create('Rally.test.mock.AjaxBuilder', Ext.create('Rally.test.mock.SnapshotAjaxInterceptor', this.ajaxInterceptor.testCase));
      builder.setVerb(verb);
      builder.setNotWsapi(true);
      return builder;
    }
  });
})();
