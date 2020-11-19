(function() {

    Ext.define('Rally.test.env.Environment', {
        extend: 'Rally.sdk.env.Environment',

        constructor: function(config) {
            var context = config && config.context || this.getDefaultContext();
            this.callParent([{
                externalContext: context
            }]);
        },

        _requiresJsonP: function() {
            return false; //phantom hack!!!
        },

        getDefaultContext: function() {
            return {
                scope: {
                    up: false,
                    down: true,
                    project: {
                        _ref: 'http://localhost:7001/slm/webservice/x/project/431439',
                        Name: 'Project 1',
                        ObjectID: 431439,
                        _refObjectUUID: 'abcd'
                    },
                    workspace: {
                        ObjectID: 10732,
                        _ref: 'http://localhost:7001/slm/webservice/x/workspace/10732',
                        _type: 'Workspace',
                        Name: 'Workspace 1',
                        WorkspaceConfiguration: {
                            DateFormat: 'yyyy-MM-dd',
                            DateTimeFormat: 'yyyy-MM-dd hh:mm:ss a',
                            DragDropEnabled: true,
                            DragDropRankingEnabled: true,
                            WorkDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
                            IterationEstimateUnitName: 'Points',
                            ReleaseEstimateUnitName: 'Points',
                            TaskUnitName: 'Hours'
                        }
                    }
                },
                user: Ext.create('Rally.domain.User', {
                    UserName: 'test user',
                    DisplayString: 'test user',
                    _ref: '/user/123',
                    _refObjectName: 'test',
                    _refObjectUUID: '123b1358-6afc-e59a-e19a-4b562105a2e0',
                    ObjectID: 123,
                    UserProfile: {
                        _ref: '/userprofile/1234',
                        ObjectID: 1234,
                        WelcomePageHidden: true,
                        DateFormat: 'yyyy-MM-dd',
                        DateTimeFormat: 'yyyy-MM-dd hh:mm:ss a',
                        EmailNotificationEnabled: true
                    }
                }),
                permissions: Ext.create('Rally.auth.UserPermissions', [
                    {
                      _ref: 'http://localhost:7001/slm/webservice/x/project/431439',
                      Role: 'Editor',
                      Workspace: '/workspace/10732'
                    }, {
                      _ref: 'http://localhost:7001/slm/webservice/x/project/431440',
                      Role: 'Viewer',
                      Workspace: '/workspace/10732'
                    }, {
                      _ref: 'http://localhost:7001/slm/webservice/x/project/431441',
                      Role: 'Viewer',
                      Workspace: '/workspace/2343'
                    }
                ]),
                subscription: {
                    MaximumProjects: -1,
                    SubscriptionType: 'Enterprise',
                    ProjectHierarchyEnabled: true,
                    StoryHierarchyEnabled: true,
                    StoryHierarchyType: 'Unlimited',
                    Modules: [],
                    EmailEnabled: true
                }
            };
        },

        getAppContext: function(overrides) {
            var context = Ext.clone(this.getContext().getProps());
            return Ext.create('Rally.app.Context', {
                initialValues: Ext.apply(context, {
                    appID: '999',
                    project: context.scope.project,
                    workspace: context.scope.workspace,
                    projectScopeUp: context.scope.up,
                    projectScopeDown: context.scope.down
                }, overrides)
            });
        }
    });
})();
