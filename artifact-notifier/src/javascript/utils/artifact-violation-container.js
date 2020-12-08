Ext.define("RallyCommunity.app.ArtifactViolationContainer", {
    extend: 'RallyCommunity.app.ViolationContainer',
    alias: 'widget.artifactviolationcontainer',

    config: {
        record: null,
        notificationColor: 'red',
        messageText: null, 
        defaultNotificationUserUUID: null,
        notificationUserField: null,
        notificationField: null,
        defaultToCreator: false,
        createdByField: 'CreatedBy',
        identifierField: null,
        settings: {},
        context: null
    },

    build: function(){
        this._loadData();
    },
    getRecords: function(){
        var deferred = Ext.create('Deft.Deferred');
        var model = this.getObjectType();
        
        var userFilters = this.down("rallyinlinefilterbutton").getWsapiFilter(); 
        var filters = this.getFilters(userFilters); 
        
        var dataContext = {project: null};
        if (this.settings.useProjectScope){
            dataContext = this.context.getDataContext();
        } 

        var limit = this.settings.safetyLimit || "Infinity";
        this.fireEvent('loadingStart');
        Ext.create('Rally.data.wsapi.Store',{
            model: model,
            fetch: this.getNotificationFields(), 
            filters: filters,
            context: dataContext,
            limit: limit,
            pageSize: 2000
        }).load({
            scope: this,
            callback: function(records, operation, success) {
                this.fireEvent('loadingComplete');
                if (operation.wasSuccessful()){
                    deferred.resolve(records);
                } else {
                    deferred.reject(operation && operation.error && operation.error.errors && operation.error.errors.join(","));
                }
            }
        });
        return deferred; 
    },
    _loadData: function(){
        var model = this.getObjectType(); 

        if (this.down('rallygridboard')){
            this.destroy('rallygridboard');
        }

        var dataContext = {project: null};
        if (this.settings.useProjectScope){
            dataContext = this.context.getDataContext();
        } 

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: [model],
            fetch: this.getNotificationFields(),
            filters: this.getFilters(),
            autoLoad: false,
            context: dataContext,
            enableHierarchy: false
        }).then({
            success: this._buildGrid,
            scope: this 
        });
    },
    _buildGrid: function(store){
        
        var model = this.getObjectType();

        var dataContext = {project: null};
        if (this.settings.useProjectScope){
            dataContext = this.context.getDataContext();
        } 

        this.add({
            xtype: 'rallygridboard',
            context: this.context,
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
                    filters: this.getFilters(),
                    context: dataContext
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
    getObjectType: function(){
        return this.settings.objectType;
    },
    getFilters: function(filters){
        var f = null; 
        if (this.settings.query){
            f = Rally.data.wsapi.Filter.fromQueryString(this.settings.query);
        }
        if (f && filters){
            console.log("getFilters",filters);
            return f.and(filters);
        }
        return f || filters || [];
    },
    getNotificationFields: function(){
        var fields = ['FormattedID'];
        if (this.settings.defaultToCreator == "true" || this.settings.defaultToCreator == true){
            fields.push("CreatedBy");
        }
        if (this.settings.notificationUserField){
            fields.push(this.settings.notificationUserField);
        }
        fields.push(this.settings.notificationField);
        return fields;
    },
    _showError: function(msg){
        this.fireEvent('loadingerror',msg);
    }
});