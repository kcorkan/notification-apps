(function() {

  Ext.define('Rally.test.mock.data.WsapiModelFactoryCache', {
    requires: ['Rally.data.wsapi.ModelFactory', 'Rally.data.TypeDefinitionMetaData', 'Rally.data.wsapi.ModelBuilder'],
    constructor: function(config) {
      this.cache = {};
      this.fieldDefaults = {
        _p: 71
      };
    },
    stubModelCache: function(testCase) {
      this.origGetModelFromCache = Ext.bind(Rally.data.wsapi.ModelFactory._getCachedModel, Rally.data.wsapi.ModelFactory);
      return testCase.stub(Rally.data.wsapi.ModelFactory, '_getCachedModel', Ext.bind(this._getCachedModel, this));
    },
    restoreModelCache: function() {
      return Rally.data.wsapi.ModelFactory._getCachedModel.restore();
    },
    clearModels: function() {
      return this.cache = {};
    },
    _getModelPath: function(version) {
      var modelPath, wsapiVersion;
      wsapiVersion = Rally.test.mock.data.WsapiModelFactory.getModelClassVersion(version);
      modelPath = Rally.test.mock.data.types;
      _.each(wsapiVersion.split('.'), (function(part) {
        return modelPath = modelPath[part];
      }), this);
      return modelPath;
    },
    _getCachedModel: function(typeDefMetaData) {
      var fullyQualified, mockModel, modelPath, type, versionMatch, wsapiVersion;
      fullyQualified = typeDefMetaData.getFullyQualifiedName();
      type = fullyQualified.substring(fullyQualified.lastIndexOf('.') + 1);
      versionMatch = fullyQualified.match(/Rally\.domain\.(.+)\.(workspace|project).*/);
      wsapiVersion = (versionMatch && versionMatch[1]) || Rally.environment.getServer().getWsapiVersion();
      modelPath = this._getModelPath(wsapiVersion);
      mockModel = void 0;
      _.each(modelPath, function(model, className) {
        if (type.toLowerCase() === className.toLowerCase()) {
          mockModel = modelPath[className];
          return false;
        }
      });
      if (mockModel) {
        return this._getModel(mockModel.getModelDefinition(), typeDefMetaData);
      }
      return this.origGetModelFromCache(typeDefMetaData);
    },
    _buildModel: function(typedef, typeDefMetaData) {
      var model;
      model = Rally.data.wsapi.ModelBuilder.build(typeDefMetaData, typedef);
      model.isWsapiModel = true;
      this.cache[typeDefMetaData.getFullyQualifiedName()] = model;
      this._setFieldDefaults(model);
      return model;
    },
    _getModel: function(typedef, typeDefMetaData) {
      var model;
      model = this.cache[typeDefMetaData.getFullyQualifiedName()];
      if (model == null) {
        model = this._buildModel(typedef, typeDefMetaData);
      }
      return model;
    },
    _setFieldDefaults: function(model) {
      var field, fields, i;
      fields = model.getFields();
      i = 0;
      while (i < fields.length) {
        field = fields[i];
        if (this.fieldDefaults[field.name]) {
          field.defaultValue = this.fieldDefaults[field.name];
        }
        i++;
      }
    }
  });

})();
