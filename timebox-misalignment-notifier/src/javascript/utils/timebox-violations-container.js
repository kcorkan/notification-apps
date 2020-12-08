Ext.define("RallyCommunity.app.TimeboxViolationContainer", {
    extend: 'RallyCommunity.app.ViolationContainer',
    alias: 'widget.timeboxviolationcontainer',

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

    displayNames: { //Technically we should pull this from the model.
        "StartDate": "Start Date",
        "EndDate": "End Date",
        "ReleaseStartDate": "Release Start Date",
        "ReleaseDate": "Release Date"
    },

    build: function(){
        this._loadData();
        //this.update("No violations have been loaded becuase there is no logic.  Please extend the Violation container class to include a build method for the display and a getRecords method for the notification.");
    },
    getRecords: function(){
        //Returns the filtered records
        var deferred = Ext.create('Deft.Deferred');
        if (this.down('rallygrid')){
            deferred.resolve(this.down('rallygrid').getStore().getRange());
        } else {
            deferred.resolve([]);
        }
        return deferred;
    },
    _loadData: function(){

        var fields = this.getTimeboxFields(),
            projectRef = this.getReferenceProject();   

        Ext.create('Rally.data.wsapi.Store',{
            model: this.getObjectType(),
            fetch: fields,
            pageSize: 2000,
            limit: "Infinity",
            filters: [{ property: "Project", value: projectRef},{property: this.getEndDateField(), operator: ">", value: 'today' }],
            sorters: [{ property: 'StartDate', direction: 'ASC'}],
            context: {
                project: projectRef,
                projectScopeUp: false,
                projectScopeDown: false
            }
        }).load({
            callback: this._buildSuspectTimeboxSearches,
            scope: this 
        });
    },
    getReferenceProject: function(){
        return this.context.getProject()._ref; 
    },
    getObjectType: function(){
        return this.settings.objectType;
    },
    getTimeboxFields: function(){
        var fields = ["Project","Name"]
        fields.push(this.getStartDateField());
        fields.push(this.getEndDateField());
        return fields;
    },
    getStartDateField: function(){
        if (this.getObjectType() == "Release"){
            return "ReleaseStartDate";
        }
        return "StartDate";
    },
    getEndDateField: function(){
        if (this.getObjectType() == "Release"){
            return "ReleaseDate";
        }
        return "EndDate";
    },
    getStartTime: function(){
        var dt = this.settings.startTime || new Date();
        return Rally.util.DateTime.toIsoString(dt);
    },
    _buildSuspectTimeboxSearches: function(records, operation, success){

        var promises = []; 
        var startDateField = this.getStartDateField(),
            endDateField = this.getEndDateField(),
            lastEndTime = this.getStartTime();

        if (!records || records.length === 0){
            this._displaySuspects(null);
            return;
        }


        for (var i=0; i<records.length; i++){
            var timebox = records[i]; 
            var orFilters = Rally.data.wsapi.Filter.or([
                    {property: "Name", operator: "!=",  value: timebox.get('Name')},
                    {property: startDateField, operator: "!=",  value: timebox.get(startDateField)},
                    {property: endDateField, operator: "!=", value: timebox.get(endDateField)}
            ]);
            
            var andFilters = Rally.data.wsapi.Filter.and([
                {property: endDateField, operator: '<=', value: timebox.get(endDateField)},
                {property: endDateField, operator: '>', value: lastEndTime}
            ]);
            
            var filter = andFilters.and(orFilters);
            lastEndTime = timebox.get(endDateField);
            
            promises.push(this._loadSuspectTimeboxes(filter));

        }
        var lastFilter = [{property: this.getEndDateField(), operator: ">", value: lastEndTime }];
        promises.push(this._loadSuspectTimeboxes(lastFilter));

        this.fireEvent('loadingstart');
        Deft.Promise.all(promises).then({
            success: this._displaySuspects,
            failure: this._showError,
            scope: this 
        }).always(function(){
            this.fireEvent('loadingcomplete');
        }, this);

    },
    _showError: function(msg){
        this.fireEvent('loadingerror',msg);
    },
    _displaySuspects: function(results){
        var records = [];
        var emptyText = "No misaligned timeboxes found in the current scope.";
        if (results === null){
            emptyText = "No reference Timeboxes were found in the current Project for the query and timerange with an EndDate > today.<br/>If there are no reference timeboxes to compare with in the current Project, no misaligned timeboxes can be identified.";
        } else {
            records = _.flatten(results);
        }

        var store = Ext.create('Rally.data.custom.Store',{
            data: records,
            pageSize: records.length 
        });
        var columnCfgs = this.getTimeboxFieldColumnCfgs(); 

        if (this.down('rallygrid')){
            this.down('rallygrid').removeAll(); 
        }

        this.add({
            xtype: 'rallygrid',
            showRowActionsColumn: false,
            editable: false, 
            store: store,
            columnCfgs: columnCfgs,
            showPagingToolbar: false,
            viewConfig: {
                emptyText: Rally.ui.EmptyTextFactory.getEmptyTextDiv(emptyText)
            } 
        });
    },
    getTimeboxFieldColumnCfgs: function(){
        var cols = Ext.Array.map(this.getTimeboxFields(), function(name){
            var displayName = this.displayNames[name] || name; 
            var cfg = { dataIndex: name, text: displayName, flex: 1 };
            if (name === "Project"){
                cfg.renderer = function(v){
                    return v && v._refObjectName; 
                }        
            }
            return cfg;
        }, this);
        return cols;
    },
    _loadSuspectTimeboxes: function(filter){
        var deferred = Ext.create('Deft.Deferred');
        var objectType = this.getObjectType(),
            fields = this.getTimeboxFields(); 

        var dataContext = {
            project: null
        };
        if (this.settings.useProjectScope === true){
            dataContext.project = this.context.getProject()._ref;
            dataContext.projectScopeDown = this.context.getProjectScopeDown();
            dataContext.projectScopeUp = this.context.getProjectScopeUp();
        }
        
        Ext.create('Rally.data.wsapi.Store',{
            model: objectType,
            fetch: fields,
            pageSize: 2000,
            limit: "Infinity",
            filters: filter, 
            context: dataContext
        }).load({
            callback: function(records,operation){
                if (operation.wasSuccessful()){
                    deferred.resolve(records);
                } else {
                    deferred.reject(operation && operation.error && operation.error.errors && operation.error.errors.join(",") || "Error loading suspect timeboxes");
                }
            },
            scope: this 
        });
        return deferred.promise; 
    }
});