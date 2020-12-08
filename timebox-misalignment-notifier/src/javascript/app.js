Ext.define("RallyCommunity.app.TimeboxMisalignmentNotifier", {
    extend: 'RallyCommunity.app.NotifierApp',

    integrationHeaders : {
        name : "RallyCommunity.app.TimeboxMisalignmentNotifier"
    },

    config: {
        defaultSettings: {
            violationsContainerType: 'timeboxviolationcontainer',
            objectFilters: Rally.data.wsapi.Filter.or([{property: "TypePath", value: "Iteration"},
                            {property: 'TypePath', value: "Release"}]),
            allowDefaultToCreator: false 
        }
    }
});
