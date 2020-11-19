Ext.define("UserNotification.Base", {
    
    mixins: {
        observable: 'Ext.util.Observable'
    },
    config: {
        record: null,
        notificationColor: 'red',
        messageText: null, 
        defaultNotificationUserUUID: null,
        notificationUserField: null,
        notificationField: null,
        defaultToCreator: false,
        createdByField: 'CreatedBy'
    
    },
    
    constructor: function(config){
        this.mixins.observable.constructor.call(this, config);
        Ext.apply(this,config);
    },

    send: function(){
        if (!this.record){
            this.fireEvent('notifyerror',"No record provided.");    
        }
        this.fireEvent('notifyerror',"Base class implemented, no message sent.");
    },
    _buildNotificationText: function (){
        var userUUID = this._getUserNotificationFieldUUID(this.record);
        if (!userUUID){
            this.fireEvent('notifyerror','No user found to mention for ' + this.record.get('FormattedID'));
            return null; 
        }
        if (!this.messageText){
            this.fireEvent('notifyerror','No message text specified for ' + this.record.get('FormattedID'));
            return null; 
        }

        var message = "<p><span class=\"mention\" contenteditable=\"false\" data-mention=\"{0}\" style=\"color:{2}\">{1}</span></p>";
        return Ext.String.format(message, userUUID, this.messageText, this.notificationColor);
    },
    _getUserNotificationFieldUUID: function(){
        var notificationField = this.notificationUserField,
            useCreator = this.defaultToCreator;

        if (!notificationField){
            return null; 
        }

        var uuid = this.record && this.record.get(notificationField) && this.record.get(notificationField)._refObjectUUID || null;
        if (!uuid && useCreator){
            uuid = this.record && this.record.get(this.createdByField)._refObjectUUID || null;
        }
        return uuid || this.defaultNotificationUserUUID;
    }
});

Ext.define("UserNotification.TextField", {
    extend: 'UserNotification.Base', 
    send: function(){
        if (!this.record){
            this.fireEvent('notifyerror',"No record provided.");    
            return;
        }

        var txt = this.record.get(this.notificationField) || "";
        var mention = this._buildNotificationText();
        if (mention === null){
            return; 
        }

        var mention = Ext.String.format("{0} <br/>{1} {2}",txt, Rally.util.DateTime.formatWithDefaultDateTime(new Date()), mention); 
        var formattedID = this.record.get('FormattedID');

        this.record.set(this.notificationField,mention);
        this.record.save({
            callback: function(result, operation) {
                if(operation.wasSuccessful()) {
                    this.fireEvent('notifysuccess',formattedID);
                } else {
                    this.fireEvent('notifyerror',formattedID);
                }
            },
            scope: this 
        });
    }
});

Ext.define("UserNotification.Discussion", {
    extend: 'UserNotification.Base', 
    send: function(){
        console.log("send discussion");
        if (!this.record){
            this.fireEvent('notifyerror',"No record provided.");    
            return;
        }

        var discussions = this.record.getCollection('Discussion');
        var mention = this._buildNotificationText();

        if (mention === null){
            return; 
        }

        var formattedID = this.record.get('FormattedID');

        discussions.load({
            callback: function() {
                discussions.add({"Text": mention});
                discussions.sync({
                    success: function(){
                        this.fireEvent('notifysuccess',formattedID);
                    },
                    failure: function(){
                        this.fireEvent('notifyerror', "Failed to save mention for " + formattedID);
                    },
                    scope: this
                });
            },
            scope: this
        });
    }
});
