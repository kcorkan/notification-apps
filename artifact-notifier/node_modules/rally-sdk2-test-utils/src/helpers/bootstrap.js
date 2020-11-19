(function() {

    var app;
    Ext.define('Rally.test.Harness', {
        singleton: true,

        launchApp: function(appCls, config) {
            app = Ext.create(appCls, Ext.apply({
                context: this.getAppContext(),
                renderTo: 'testDiv',
                appScopedSettings: {},
                workspaceScopedSettings: {},
                projectScopedSettings: {},
                userScopedSettings: {}
            }, config));
            return app;
        },

        getAppContext: function(contextConfig) {
            return Rally.environment.getAppContext(contextConfig);
        },

        destroyApp: function() {
          if (app) {
            app.destroy();
            app = null;
          }
        }
    });
})();
