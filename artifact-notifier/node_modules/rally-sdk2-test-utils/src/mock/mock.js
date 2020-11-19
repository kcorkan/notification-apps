(function() {

  var sinonSandbox;

  Ext.define('Rally.test.mock.Mock', {

    constructor: function(config) {
      this.callParent(arguments);
      Ext.apply(this, config);

      Rally.test.mock.data.WsapiModelFactory.stubModelCache(this.sinon);
      Rally.test.mock.data.WsapiModelFactory.clearModels();
    },

    stub: function() {
      return this.sinon.stub.apply(this.sinon, arguments);
    },

    spy: function() {
      return this.sinon.spy.apply(this.sinon, arguments);
    }
  });

  beforeEach(function() {
    var config = Ext.apply(sinon.getConfig(sinon.config), {
      injectInto: this,
      useFakeTimers: false,
      useFakeServer: false
    });
    sinonSandbox = sinon.sandbox.create(config);

    var ajax = Ext.create('Rally.test.mock.AjaxBuilder', Ext.create('Rally.test.mock.AjaxInterceptor', sinonSandbox));
    var mock = Rally.test.Mock = Ext.create('Rally.test.mock.Mock', {
      ajax: ajax,
      dataFactory: Rally.test.mock.ModelObjectMother,
      sinon: sinonSandbox
    });

    this.ajax = ajax;
    this.dataFactory = Rally.test.mock.ModelObjectMother;
  });

  afterEach(function() {
    sinonSandbox.verifyAndRestore();
    sinonSandbox = null;
  });

})();
