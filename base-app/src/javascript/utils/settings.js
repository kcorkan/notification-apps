Ext.define("RallyCommunity.app.notiferApp.Settings", {
    singleton: true,
    
    validate: function(settings, logger){

        _.each(settings, function(v,k){
            logger.log("setting [" + k + "]: " + v);
        });

        var errors=[];
        if (!settings.objectType){
            errors.push("An object type must be selected in the app settings.");
        }
        if (!settings.messageText){
            errors.push("A message must be specified in app settings");
        }
        if (!settings.notificationUserField && !settings.defaultUserUUID){
            errors.push("Please specify a User field or default User to notify.");
        }
        if (!settings.notificationField){
            errors.push("Please specify a field for notifications to be written to.");
        }
        return errors; 
    },
    getSettingsFields: function(settings, objectFilters){
        var check_box_margins = '5 0 5 0';
        var query = settings && settings.query,
            labelWidth = 300,
            comboBoxWidth = 500;

        var filter = objectFilters || settings.objectFilters || [{ property: 'Creatable', value: true}],
            allowDefaultToCreator = settings.allowDefaultToCreator || false;
        
        var fields = [{
            name: 'objectType',
            xtype: 'rallycombobox',
            fieldLabel: 'Object Type',
            labelWidth: labelWidth, 
            labelAlign: 'right',
            emptyText: 'Choose Object Type...',
            valueField: 'TypePath',
            displayField: 'Name',
            storeConfig: {
                model: 'TypeDefinition',
                sorters: [{ property: 'DisplayName' }],
                fetch: ['DisplayName', 'TypePath'],
                filters: filter,
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
            fieldLabel: 'User Field to Notify',
            labelWidth: labelWidth, 
            width: comboBoxWidth,
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
            _isNotHidden: function(field){
                if (field.attributeDefinition){
                    if (field.attributeDefinition.SchemaType === "User"){
                        return true; 
                    }
                }
                return false;
            }
        }];
        
        if (allowDefaultToCreator === true){
            fields.push({
                name: 'defaultToCreator',
                xtype: 'rallycheckboxfield',
                fieldLabel: 'Notify Creator if User Field is empty',
                labelWidth: labelWidth,
                labelAlign: 'right',
                enabled: allowDefaultToCreator
            });
        } else {
            fields.push({
                name: 'defaultUserUUID',
                xtype: 'settingsusercombobox',
                labelWidth: labelWidth, 
                width: comboBoxWidth,
                labelAlign: 'right',
                fieldLabel: "Default User to notify (if User Field is empty)",
                value: settings.defaultUserUUID
            });
        }
        
        fields = fields.concat([{
            name: 'notificationField',
            xtype: 'rallyfieldcombobox',
            fieldLabel: 'Notification Field',
            labelWidth: labelWidth, 
            width: comboBoxWidth,
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
            name: 'messageText',
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
                }
            }
        },{
            name: 'safetyLimit',
            xtype: 'rallynumberfield',
            minValue: 0,
            maxValue: settings.maxSafetyLimit || 10000,
            fieldLabel: 'Saftey Limit',
            labelWidth: labelWidth,
            labelAlign: 'right'
        },{
            name: 'saveLog',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: check_box_margins,
            boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

        }]);
        return fields; 
    }
});