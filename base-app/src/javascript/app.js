Ext.define("RallyCommunity.app.NotifierApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new RallyCommunity.app.Logger(),
    defaults: { margin: 10 },

    integrationHeaders : {
        name : "RallyCommunity.app.NotifierApp"
    },
    
    config: {
        defaultSettings: {
            defaultToCreator: false,
            defaultUserUUID: null,
            messageText: 'This is a message',
            notificationColor: 'red',
            notificationField: null,
            notificationUserField: 'Owner',
            objectType: null,
            query: "(ObjectID > 0)",
            referenceProject: null,
            violationsContainerType: 'violationscontainer',
            useProjectScope: false,
            safetyLimit: 100,
            maxSafetyLimit: 1000
        }
    },
    showDuration: 2000, 

    launch: function() {
        
        var errors = RallyCommunity.app.notiferApp.Settings.validate(this.getSettings(), this.logger);
        if (errors && errors.length > 0){
            this.add({
                xtype: 'container',
                itemId: 'notification_box',
                html: errors.join("<br/>")
            });
            return;
        }

        this.add({
            xtype: 'container',
            itemId: 'notification_box',
            layout: 'vbox'
        });

        if (this.enableSendNotifications()){
            this.logger.log("send notifications enabled!")
            this.down('#notification_box').add({
                xtype: 'rallybutton',
                text: 'Send Notifications',
                iconCls: 'icon-bell',
                cls: 'send-notifications',
                handler: this._sendNotifications,
                scope: this 
            });    
        }
        
        this.down('#notification_box').add({
            xtype: 'container',
            itemId: 'notification_text',
            cls: 'notification-label',
            html: Ext.String.format("<p><span style=\"color:{1};\">{0}</span></p>",this.getSetting('messageText'), this.getSetting('notificationColor')),
            readOnly: true, 
            width: "75%"
        });
        
        this.logger.log("ViolationsContainerType = " + this.getViolationsContainerType());
        this.add({
            xtype: this.getViolationsContainerType(),
            itemId: 'violations',
            settings: this.getSettings(),
            context: this.getContext(),
            listeners: {
                loadingstart: this.startLoading,
                loadingcomplete: this.stopLoading,
                loadingerror: this._notifyError,
                scope: this 
            }
        });

    },
    enableSendNotifications: function(){
        try {
            var permissions = this.getContext().getPermissions(),
            currentWorkspace = Rally.util.Ref.getOidFromRef(this.getContext().getWorkspace()._ref);
    
            for (var i=0; i<permissions.userPermissions.length; i++){
                if (permissions.userPermissions[i].Role === "Subscription Admin"){
                    this.logger.log('Current user is subscription administrator.  Enabling send notifications.');
                    i = permissions.userPermissions.length;
                    return true; 
                } else if (permissions.userPermissions[i].Role === "Workspace Admin"){
                    var permissionWorkspaceOid = Rally.util.Ref.getOidFromRef(permissions.userPermissions[i]._ref);
                    if (permissionWorkspaceOid === currentWorkspace){
                        this.logger.log('Current user is workspace administrator for the current workspace.  Enabling send notifications.');
                        return true; 
                    }
                }
            }
        } catch(e){
            this.logger.log('Error checking permissions: ' + e);
        }
        return false; 
    },
    startLoading: function(msg){
        msg = msg || 'Loading possible violations...';
        this.setLoading(msg);
    },
    stopLoading: function(){
        this.setLoading(false);
    },
    _sendNotifications: function(){
        
        this.success = 0;
        this.failure = 0;
        this.failureMessages = [];
        
        var notificationType = this.getNotificationType(),
            messageText = this.getSetting('messageText'),
            defaultNotificationUserUUID = this.getSetting('defaultUserUUID'),
            notificationUserField = this.getSetting('notificationUserField'),
            defaultToCreator = this.getSetting('defaultToCreator'),
            notificationColor = this.getSetting('notificationColor'),
            notificationField= this.getSetting('notificationField');

        this.logger.log('notificationField',notificationField);
        
        this.down('#violations').getRecords().then({
            success: function(records){
                this.total = records.length; 
                var maxLength = records.length; 
                if (this.getSafetyLimit() > 0 && maxLength > this.getSafetyLimit()) {
                    maxLength = this.getSafetyLimit();
                    this.total = maxLength;
                   // Rally.ui.notify.Notifier.showWarning({message: "The number of records meeting the notification criteria [" + this.total + "] exceeds the safety limit of " + maxLength + ".  Only " + maxLength + " records will be updated with notifications.", showDuration: this.showDuration});
                }

                for (var i=0; i<maxLength; i++){

                    try {
                        var r = records[i];
                        var notification = Ext.create(notificationType,{
                            record: r, 
                            messageText: messageText, 
                            defaultNotificationUserUUID: defaultNotificationUserUUID,
                            notificationUserField: notificationUserField,
                            defaultToCreator: defaultToCreator,
                            notificationColor: notificationColor,
                            notificationField: notificationField,
                            listeners: {
                                notifyerror: this._notifyError,
                                notifysuccess: this._notifySuccess,
                                scope: this 
                            }
                        });
                        notification.send();
                    } catch(e){
                        this._notifyError ("Unexpected error sending notification: " + e);
                    }
                }
            }, 
            failure: this._notifyError,
            scope: this 
        });
    },
    getSafetyLimit: function(){
        return this.getSetting('safetyLimit');
    },
    _notifyError: function(msg){
        this.logger.log("notification Error! ", msg);
        this.failure++;
        this.failureMessages.push(msg);
        //Rally.ui.notify.Notifier.showError({message: msg, showDuration: this.showDuration});
        if ((this.success + this.failure) >= this.total){
            this._notifyComplete();
        }
    },
    _notifySuccess: function(formattedID){
        this.logger.log("notifying ", formattedID);
        this.success++;
        console.log('total',this.success + this.failure);
        if ((this.success + this.failure) >= this.total ){
           this._notifyComplete();
        }
    },
    _notifyComplete:  function(){
        this.logger.log("Notification updates complete.  Success=" + this.success + ", Failures=" + this.failure + ", Total=" + this.total);
        var successMessage = Ext.String.format("{0} of {1} notifications made successfully.", this.success, this.total);
        if (this.failureMessages.length > 0){
            successMessage += "<br><br>Notification Errors:<br>" + this.failureMessages.join("<br>");
            Rally.ui.notify.Notifier.showWarning({message: successMessage, showDuration: this.showDuration, allowHTML: true});
        } else {
            Rally.ui.notify.Notifier.show({message: successMessage, showDuration: this.showDuration});
        }
        
    },
    getViolationsContainerType: function(){
        return this.getSetting('violationsContainerType')
    },   
    getNotificationType: function(){
        if (this.getSetting('notificationField') === "Discussion"){
            return "UserNotification.Discussion";
        }
        return "UserNotification.TextField";
    },
    getSettingsFields: function() {
         return RallyCommunity.app.notiferApp.Settings.getSettingsFields(this.getSettings());
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

        this.about_dialog = Ext.create('RallyCommunity.app.InfoLink',{
            showLog: this.getSetting('saveLog'),
            logger: this.logger
        });
    },
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }
});
