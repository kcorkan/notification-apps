Ext.define("RallyCommunity.app.NotifierApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },

    items: [
        {xtype:'container',flex: 1, itemId:'grid_box1', region: 'west'},
        {xtype:'container',flex: 1, itemId:'grid_box2', region: 'east'}
    ],

    integrationHeaders : {
        name : "RallyCommunity.app.NotifierApp"
    },

    config: {
        defaultSettings: {
            object_type: 'hierarchicalrequirement',
            query: '(ObjectID = 0)',
            message_text: "ACTION REQUESTED: This item is orphaned.  Please assign a Feature Parent to this item.",
            defaultToCreator: true, 
            notificationUserField: 'Owner',
            notificationField: 'Discussion',
            useDataContext: true,
            defaultNotificationUserUUID: null, //UUID of a default notification user should all fields be blank. Not setup in settings.
            notificationColor: 'red'
        } 
    },

    launch: function() {

        if (!this._validateSettings()){
            return; 
        }

        this.add({
            xtype: 'container',
            itemId: 'notification_box',
            layout: 'vbox'
        });
        this.down('#notification_box').add({
            xtype: 'rallybutton',
            text: 'Send Notifications',
            iconCls: 'icon-bell',
            cls: 'send-notifications',
            handler: this._sendNotifications,
            scope: this 
        });
        this.down('#notification_box').add({
            xtype: 'container',
            itemId: 'notification_text',
            cls: 'notification-label',
            html: Ext.String.format("<p><span style=\"color:{1};\">{0}</span></p>",this.getSetting('message_text'), this.getSetting('notificationColor')),
            readOnly: true, 
            width: "75%"
        });

       //notification.update({"user":"","msg":this.getSetting('message_text')});
        this._loadData(); 
    },
    _validateSettings: function(){
        var errors=[];
        if (!this.getSetting('object_type')){
            errors.push("An object type must be selected in the app settings.");
        }
        if (!this.getSetting('message_text')){
            errors.push("A message must be specified in app settings");
        }
        if (!this.getSetting('notificationUserField') && !this.getSettings('defaultToCreator')){
            errors.push("Please specify a User field to notify.");
        }

        if (errors.length > 0){
            this.add({
                xtype: 'container',
                itemId: 'notification_box',
                html: errors.join("<br/>")
            });
            return false; 
        }
        return true;  
    },
    _sendNotifications: function(){
        var store = this.down('rallygridboard').getGridOrBoard().getStore();
        var model = this.getSetting('object_type');
        
        var userFilters = this.down("rallyinlinefilterbutton").getWsapiFilter(); 
        var filters = this.getFilters(userFilters); 

        this.success = 0;
        this.failure = 0;
        
        var notificationType = this.getNotificationType(),
            messageText = this.getSetting('message_text'),
            defaultNotificationUserUUID = this.getSetting('defaultNotificationUserUUID'),
            notificationUserField = this.getSetting('notificationUserField'),
            defaultToCreator = this.getSetting('defaultToCreator');

        Ext.create('Rally.data.wsapi.Store',{
            model: model,
            fetch: this.getNotificationFields(), 
            filters: filters,
            limit: Infinity,
            pageSize: 2000
        }).load({
            scope: this,
            callback: function(records, operation, success) {
                // the operation object
                // contains all of the details of the load operation
                if (success){
                    for (var i=0; i<records.length; i++){
                        try {
                            Ext.create(notificationType,{
                                record: records[i], 
                                messageText: messageText, 
                                defaultNotificationUserUUID: defaultNotificationUserUUID,
                                notificationUserField: notificationUserField,
                                defaultToCreator: defaultToCreator,
                                notificationColor: this.getSetting('notificationColor'),
                                notificationField: this.getSetting('notificationField'),
                                listeners: {
                                    notifyerror: this._notifyError,
                                    notifysuccess: this._notifySuccess,
                                    scope: this 
                                }
                            }).send();
                        } catch(e){
                            this.logger.log("Error " + e);
                        }
                    }
                } else {
                   this.logger.log("Error loading records for notification");
                }
            }
        });
    },
    _notifyError: function(msg){
        this.logger.log("_notifyError", msg);
    },
    _notifySuccess: function(formattedID){
        this.logger.log("_notifySuccess", formattedID);
    },

    _loadData: function(){
        var model = this.getSetting('object_type'),
            context = this.getContext(); 

        if (this.down('rallygridboard')){
            this.destroy('rallygridboard');
        }

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: [model],
            fetch: this.getNotificationFields(),
            filters: this.getFilters(),
            autoLoad: false,
            enableHierarchy: false
        }).then({
            success: this._buildGrid,
            scope: this 
        });
    },
    _buildGrid: function(store){
        
        var model = this.getSetting('object_type'),
        context = this.getContext(); 
        
        this.add({
            xtype: 'rallygridboard',
            context: context,
            modelNames: [model],
            toggleState: 'grid',
            plugins: [{
                ptype: 'rallygridboardinlinefiltercontrol',
                    inlineFilterButtonConfig: {
                        modelNames: [model],
                        inlineFilterPanelConfig: {
                            collapsed: false
                        }
                    }
            },{
                ptype: 'rallygridboardfieldpicker',
                headerPosition: 'left',
                modelNames: [model],
                // stateful: true,
                // stateId: context.getScopedStateId('notifier-columns')
            }],
            gridConfig: {
                store: store,
                storeConfig: {
                    filters: this.getFilters()
                },
                enableBulkEdit: false,
                enableEditing: false,
                enableRanking: false,
                shouldShowRowActionsColumn: false,
                columnCfgs: [
                    "FormattedID",
                    'Name',
                    'CreatedBy',
                    'Project'
                ]
            },
            height: 400
        });
    },
    getScopeContext: function(){
        if (this.getSetting('useDataContext') == "true" || this.getSetting('useDataContext') == true){
            return this.getDataContext();
        }
        return { project: null };
    },
    getFilters: function(filters){
        var f = null; 
        if (this.getSetting('query')){
            f = Rally.data.wsapi.Filter.fromQueryString(this.getSetting('query'));
        }
        if (f && filters){
            console.log("getFilters",filters);
            return f.and(filters);
        }
        return f || filters || [];
    },
    getNotificationFields: function(){
        var fields = ['FormattedID'];
        if (this.getSetting('defaultToCreator') == "true" || this.getSetting('defaultToCreator') == true){
            fields.push("CreatedBy");
        }
        if (this.getSetting('notificationUserField')){
            fields.push(this.getSetting('notificationUserField'));
        }
        fields.push(this.getSetting('notificationField'));
        return fields;
    },
    getNotificationType: function(){
        if (this.getSetting('notificationField') === "Discussion"){
            return "UserNotification.Discussion";
        }
        return "UserNotification.TextField";
    },
    getUserNotificationFieldUUID: function(record){
        var notificationField = this.getSetting('notificationUserField'),
            useCreator = this.getSetting('defaultToCreator') == "true" || this.getSetting('defaultToCreator') == true;

        var uuid = record && record.get(notificationField) && record.get(notificationField)._refObjectUUID || null;
        if (!uuid && useCreator){
            uuid = record && record.get('CreatedBy')._refObjectUUID || null;
        }
        return uuid || this.getDefaultNotificationUser();
    },
    getSettingsFields: function() {
        var check_box_margins = '5 0 5 0';
        var query = this.getSetting('query'),
            labelWidth = 200;


        var artifactFilter = [{property: "TypePath", operator: "contains", value: "PortfolioItem/" },
                            {property: "Typepath", value: "HierarchicalRequirement"},
                            {property: 'TypePath', value: "Defect"},
                            {property: "TypePath", value: "Task"},
                            {property: "TypePath", value:"TestCase"},
                            {property: "TypePath", value: "DefectSuite"},
                            {property: "TypePath", value: "TestSet"}];
            artifactFilter = Rally.data.wsapi.Filter.or(artifactFilter);

            return [{
            name: 'object_type',
            xtype: 'rallycombobox',
            fieldLabel: 'Object Type',
            labelWidth: labelWidth, 
            labelAlign: 'right',
            emptyText: 'Choose Artifact Type...',
            //value: this.artifactType,
            valueField: 'TypePath',
            displayField: 'Name',
            storeConfig: {
                model: 'TypeDefinition',
                sorters: [{ property: 'DisplayName' }],
                fetch: ['DisplayName', 'TypePath'],
                filters: artifactFilter,
                autoLoad: false,
                remoteSort: false,
                sortOnLoad: true,
                remoteFilter: true
            },
            valueField: 'TypePath',
            displayField: 'DisplayName',
            listeners: {
                change: function(combo) {
                    combo.fireEvent('typeselected', combo.getValue(), combo.context);
                },
                ready: function(combo) {
                    combo.fireEvent('typeselected', combo.getValue(), combo.context);
                }
            },
            bubbleEvents: ['typeselected'],
            readyEvent: 'ready'
        
        },{
            name: 'notificationUserField',
            xtype: 'rallyfieldcombobox',
            fieldLabel: 'User to Notify',
            labelWidth: labelWidth, 
            labelAlign: 'right',
            readyEvent: 'ready',
            handlesEvents: {
                typeselected: function(models, context) {
                    var type = Ext.Array.from(models)[0];
                    if (type) {
                        this.refreshWithNewModelType(type, context); 
                    }
                    else {
                        this.store.removeAll();
                        this.reset();
                    }
                }
            },
            _isNotHidden: function(field) {
                if (field.attributeDefinition){
                    if (field.attributeDefinition.SchemaType === "User"){
                        return true; 
                    }
                }
                return false;
            },
        },{
            name: 'defaultToCreator',
            xtype: 'rallycheckboxfield',
            fieldLabel: 'Notify Creator if User Field is empty',
            labelWidth: labelWidth
        },{
            name: 'notificationField',
            xtype: 'rallyfieldcombobox',
            fieldLabel: 'Notification Field',
            labelWidth: labelWidth, 
            labelAlign: 'right',
            readyEvent: 'ready',
            handlesEvents: {
                typeselected: function(models, context) {
                    var type = Ext.Array.from(models)[0];
                    if (type) {
                        this.refreshWithNewModelType(type, context); 
                    }
                    else {
                        this.store.removeAll();
                        this.reset();
                    }
                }
            },
            _isNotHidden: function(field) {
                console.log('field',field);
                if (field.attributeDefinition){
                    if (field.attributeDefinition.AttributeType === "TEXT" && field.readOnly === false){
                        return true; 
                    }
                    if (field.attributeDefinition.Name === "Discussion"){
                        return true; 
                    }
                }
                return false;
            },
        },{
            name: 'message_text',
            xtype: 'textarea',
            labelWidth: labelWidth, 
            labelAlign: 'right',
            labelSeparator: '',
            flex: 1,
            anchor: '100%',
            fieldLabel: 'Nofication Message'
        },{
            name: 'query',
            xtype: 'textarea',
            width: '100%',
            labelWidth: labelWidth, 
            labelAlign: 'right',
            labelSeparator: '',
            fieldLabel: 'Query',
            margin: '2 0 2 0',
            flex: 1,
            anchor: '100%',
           // cls: 'query-field',
          //  margin: '0 70 0 0',
            plugins: [
              'rallyfieldvalidationui'
            ],
            emptyText: 'Type a Rally Query like ( ObjectID > 0 )...',
            value: query,
            validateOnBlur: true,
            validateOnChange: false,
            validator: function(value) {
              if (!value){ return "Query is required."; }
              try {
                if (value) {
                  Rally.data.wsapi.Filter.fromQueryString(value);
                }
                return true;
              } catch (e) {
                return e.message;
              }
            },
            listeners: {
                validitychange: function(){
                  this.fireEvent('rowvalidate',this);
                },
               scope: this
            }
        },{
            name: 'saveLog',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: check_box_margins,
            boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

        }];

    },
    getDefaultNotificationUser: function(){
        return this.getSetting('defaultNotificationUserUUID');
    },
    getOptions: function() {
        var options = [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];

        return options;
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }

        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{
            showLog: this.getSetting('saveLog'),
            logger: this.logger
        });
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }

});
