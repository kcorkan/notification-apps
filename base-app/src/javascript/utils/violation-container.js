Ext.define("RallyCommunity.app.ViolationContainer", {
    extend: 'Ext.container.Container',
    alias: 'widget.violationscontainer',

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
    constructor: function(config){
        this.callParent([config]);
        this.addEvents('loadingstart','loadingerror','loadingcomplete');
        this.build();
    },
    build: function(){
        this.update("No violations have been loaded becuase there is no logic.  Please extend the Violation container class to include a build method for the display and a getRecords method for the notification.");
    },
    getRecords: function(){
        //Returns the filtered records
        var deferred = Ext.create('Deft.Deferred');
        deferred.resolve([]);
        return deferred;
    }
});