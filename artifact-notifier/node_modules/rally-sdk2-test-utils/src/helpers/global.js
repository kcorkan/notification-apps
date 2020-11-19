(function() {

  var global;

  Ext.define('Rally.test.env.Global', {
    extend: 'Rally.env.Global',

    setup: function(environmentConfig) {
      Rally.environment = Ext.create('Rally.test.env.Environment', environmentConfig);
    },

    tearDown: function() {
      Rally.test.Harness.destroyApp();
    }
  });

  beforeEach(function(done) {
    global = Ext.create('Rally.test.env.Global');
    global.setup();

    Rally.onReady(done);
  });

  afterEach(function() {
    global.tearDown();
    global = null;
  });

})();
