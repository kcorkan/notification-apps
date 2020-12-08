Ext.define("RallyCommunity.app.ArtifactNotifierApp", {
    extend: 'RallyCommunity.app.NotifierApp',
  
    integrationHeaders : {
        name : "RallyCommunity.app.ArtifactNotifierApp"
    },

    config: {
        defaultSettings: {
            violationsContainerType: 'artifactviolationcontainer',
            objectFilters: Rally.data.wsapi.Filter.or([{property: "TypePath", operator: "contains", value: "PortfolioItem/" },
                {property: "Typepath", value: "HierarchicalRequirement"},
                {property: 'TypePath', value: "Defect"},
                {property: "TypePath", value: "Task"},
                {property: "TypePath", value:"TestCase"},
                {property: "TypePath", value: "DefectSuite"},
                {property: "TypePath", value: "TestSet"}]),
            allowDefaultToCreator: true,
            useProjectScope: false
        }
    }
});
