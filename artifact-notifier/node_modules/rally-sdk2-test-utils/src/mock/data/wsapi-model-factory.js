(function() {

  Ext.define('Rally.test.mock.data.WsapiModelFactory', {
    singleton: true,
    mixins: {
      modelCache: 'Rally.test.mock.data.WsapiModelFactoryCache'
    },
    // requires: ['Rally.test.mock.data.types.v2_x.Schema'],
    constructor: function(config) {
      return this.mixins.modelCache.constructor.call(this);
    },
    getModelDefinition: function(type, version) {
      var foundType, keys, modelDef;
      type = this._getClassName(type);
      modelDef = this._getModelPath(version);
      if (modelDef) {
        keys = _.keys(modelDef);
        foundType = _.filter(keys, function(key) {
          return key.toLowerCase() === type.toLowerCase();
        })[0];
        if (foundType) {
          return modelDef[foundType].getModelDefinition();
        }
      }
      throw new Error("Did not find typedefinition for: " + type + " and version: " + version);
    },
    getModel: function(type, version, context) {
      var typeDefMetaData;
      if (context == null) {
        context = {};
      }
      typeDefMetaData = new Rally.data.TypeDefinitionMetaData({
        context: Rally.data.wsapi.ModelFactory._getContext(context),
        wsapiVersion: Rally.test.mock.data.WsapiModelFactory.getModelClassVersion(version),
        requested: type
      });
      return this._getModel(this.getModelDefinition(type, version), typeDefMetaData);
    },
    _getClassName: function(type) {
      return type.replace(/[\/\-]/, '').replace(/\s/g, '').replace(/^userstory$/i, 'HierarchicalRequirement').replace(/^artifact$/i, 'HierarchicalRequirement');
    },
    getModelClassVersion: function(version) {
      var wsapiVersion;
      wsapiVersion = Rally.environment.getServer().getWsapiVersion(version);
      if (wsapiVersion.match(/1\.\d+/)) {
        wsapiVersion = 'x';
      } else {
        if (wsapiVersion.match(/2\.\d+/)) {
          wsapiVersion = 'v2.x';
        }
      }
      return wsapiVersion;
    },
    getIterationModel: function(version) {
      return this.getModel('Iteration', version);
    },
    getReleaseModel: function(version) {
      return this.getModel('Release', version);
    },
    getTaskModel: function(version) {
      return this.getModel('Task', version);
    },
    getDefectModel: function(version) {
      return this.getModel('Defect', version);
    },
    getDefectSuiteModel: function(version) {
      return this.getModel('DefectSuite', version);
    },
    getTestCaseModel: function(version) {
      return this.getModel('TestCase', version);
    },
    getTestCaseResultModel: function(version) {
      return this.getModel('TestCaseResult', version);
    },
    getTestSetModel: function(version) {
      return this.getModel('TestSet', version);
    },
    getTestFolderModel: function(version) {
      return this.getModel('TestFolder', version);
    },
    getUserStoryModel: function(version) {
      return this.getModel('HierarchicalRequirement', version);
    },
    getHierarchicalRequirementModel: function(version) {
      return this.getModel('HierarchicalRequirement', version);
    },
    getDeliveryGroupModel: function(version) {
      return this.getModel('DeliveryGroup', version);
    },
    getMilestoneModel: function(version) {
      return this.getModel('Milestone', version);
    },
    getPortfolioItemModel: function(version) {
      return this.getModel('PortfolioItem', version);
    },
    getPortfolioItemProjectModel: function(version) {
      return this.getModel('PortfolioItem/Project', version);
    },
    getPortfolioItemStrategyModel: function(version) {
      return this.getModel('PortfolioItem/Strategy', version);
    },
    getPortfolioItemThemeModel: function(version) {
      return this.getModel('PortfolioItem/Theme', version);
    },
    getPortfolioItemInitiativeModel: function(version) {
      return this.getModel('PortfolioItem/Initiative', version);
    },
    getPortfolioItemFeatureModel: function(version) {
      return this.getModel('PortfolioItem/Feature', version);
    },
    getUserStoryRequiredFieldsModel: function(version, context) {
      var typeDefMetaData;
      if (context == null) {
        context = {};
      }
      typeDefMetaData = new Rally.data.TypeDefinitionMetaData({
        context: Rally.data.wsapi.ModelFactory._getContext(context),
        wsapiVersion: Rally.test.mock.data.WsapiModelFactory.getModelClassVersion(version),
        requested: 'UserStory'
      });
      return this._buildModel(this._getModelPath(version)[this._getClassName('HierarchicalRequirement')].getRequiredFieldsModelDefinition(), typeDefMetaData);
    },
    getTagModel: function(version) {
      return this.getModel('Tag', version);
    },
    getProjectModel: function(version) {
      return this.getModel('Project', version);
    },
    getWorkspaceModel: function(version) {
      return this.getModel('Workspace', version);
    },
    getStateModel: function(version) {
      return this.getModel('State', version);
    },
    getAttributeDefinitionModel: function(version) {
      return this.getModel('AttributeDefinition', version);
    },
    getScopedAttributeDefinitionModel: function(version) {
      return this.getModel('ScopedAttributeDefinition', version);
    },
    getTypeDefinitionModel: function(version) {
      return this.getModel('TypeDefinition', version);
    },
    getPreferenceModel: function(version) {
      return this.getModel('Preference', version);
    },
    getConversationPostModel: function(version) {
      return this.getModel('ConversationPost', version);
    },
    getAttachmentModel: function(version) {
      return this.getModel('Attachment', version);
    },
    getUserModel: function(version) {
      return this.getModel('User', version);
    },
    getUserProfileModel: function(version) {
      return this.getModel('UserProfile', version);
    },
    getRevisionModel: function(version) {
      return this.getModel('Revision', version);
    },
    getRevisionHistoryModel: function(version) {
      return this.getModel('RevisionHistory', version);
    },
    getBlockerModel: function(version) {
      return this.getModel('Blocker', version);
    },
    getAllowedAttributeValueModel: function(version) {
      return this.getModel('AllowedAttributeValue', version);
    },
    getExpertiseModel: function(version) {
      return this.getModel('Expertise', version);
    }
  });

})();
