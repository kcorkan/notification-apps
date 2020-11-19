(function() {

  Ext.define('Rally.test.mock.ModelObjectMother', {
    singleton: true,
    requires: ['Rally.test.mock.data.WsapiModelFactory'],
    typeMap: {
      subscriptionworkspacestype: 'Workspace',
      workspaceprojectstype: 'Project',
      projectbuilddefinitionstype: 'BuildDefinition',
      builddefinitionbuildstype: 'Build',
      buildchangesetstype: 'ChangeSet',
      requirement: 'UserStory',
      artifact: 'UserStory',
      typedefinitionattributestype: 'AttributeDefinition',
      initiative: 'portfolioiteminitiative',
      "user:currentpermissions/all": ''
    },
    constructor: function(config) {
      return this.objectID = 10000;
    },
    getRecord: function(type, options) {
      return this.getRecords(type, options)[0];
    },
    getRecords: function(type, options) {
      var data, model;
      data = this.getData(type, options);
      type = this.typeMap[typeof type.toLowerCase === "function" ? type.toLowerCase() : void 0] || type;
      model = this.getModel(type);
      return _.map(data, function(datum) {
        var record;
        record = new model(datum);
        if ((options != null ? options.phantom : void 0) != null) {
          record.phantom = options.phantom;
        }
        record.raw = datum;
        return record;
      });
    },
    getData: function(type, options) {
      var data, datum, index, values, virtualFields, _i, _j, _len, _len1, _results;
      if (options == null) {
        options = {};
      }
      this.wsapiVersion = Rally.test.mock.data.WsapiModelFactory.getModelClassVersion(options.version);
      values = options.values || [];
      if (Ext.isObject(values)) {
        values = [values];
      }
      data = this.getDataInternal(type, options, options.createImmediateSubObjects);
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        datum = data[_i];
        datum._fromMOM = true;
      }
      virtualFields = values.length === 0 ? [] : _(this.getModel(type).getFields()).filter({
        virtual: true
      }).pluck('name').value();
      _results = [];
      for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
        datum = data[index];
        _results.push(Ext.merge(datum, _.omit.apply(_, [values[index] || {}].concat(virtualFields))));
      }
      return _results;
    },
    getDataInternal: function(type, options) {
      var count, data, datum, field, model, num, _i, _j, _len, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      type = this.typeMap[typeof type.toLowerCase === "function" ? type.toLowerCase() : void 0] || type;
      if (options.depth == null) {
        options.depth = 3;
      }
      data = [];
      count = options.count != null ? options.count : (((_ref = options.values) != null ? _ref.length : void 0) != null ? options.values.length : 1);
      if (count > 0) {
        model = this.getModel(type);
      }
      for (num = _i = 0; 0 <= count ? _i < count : _i > count; num = 0 <= count ? ++_i : --_i) {
        datum = {
          ObjectID: type === 'AllowedAttributeValue' && !options.withRefs ? null : this.getNextObjectID()
        };
        _ref1 = model.getFields();
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          field = _ref1[_j];
          if (field.name !== 'ObjectID') {
            datum[field.name] = this.getValue(model.typePath, field, datum, options);
          }
        }
        data[num] = datum;
      }
      return data;
    },
    getValue: function(type, field, datum, options) {
      var workspace, _ref, _ref1;
      switch (field.name) {
        case '_ref':
          return this.buildRef(type, datum.ObjectID);
        case '_refObjectUUID':
          return this.buildUUID();
        case '_type':
          return type;
        case '_refObjectName':
          return this.buildString(field);
        case '_objectVersion':
          return 1;
        case 'VersionId':
          return 1;
        case '_createdAt':
          return '3 days ago';
        case '_p':
          return 7;
        case 'Workspace':
          workspace = Ext.clone(Rally.environment.getContext().getWorkspace());
          workspace._ref = Rally.util.Ref.getRelativeUri(workspace);
          return workspace;
        case 'DirectChildrenCount':
          if (options.emptyCollections) {
            return 0;
          } else {
            return 3;
          }
        default:
          if (options.depth === 0) {
            return this.buildRefObject(type);
          } else if (typeof field.isCollection === "function" ? field.isCollection() : void 0) {
            return this.buildCollection(type, field, datum, options);
          } else if (((_ref = field.attributeDefinition) != null ? _ref.Constrained : void 0) && ((_ref1 = field.attributeDefinition) != null ? _ref1.SchemaType : void 0) !== 'Project') {
            return this.buildConstrainedValue(type, field, options);
          } else if (field.attributeDefinition != null) {
            return this.getByType(field, options);
          } else {
            return null;
          }
      }
    },
    getByType: function(field, options) {
      var opts;
      opts = Ext.applyIf({
        count: 1,
        depth: options.depth - 1
      }, options);
      switch (field.attributeDefinition.SchemaType || field.attributeDefinition.Type) {
        case 'xsd:string':
        case 'string':
          return this.buildString(field);
        case 'xsd:dateTime':
        case 'dateTime':
          return this.buildTime(field);
        case 'xsd:long':
        case 'long':
          return this.buildLong(field);
        case 'xsd:boolean':
        case 'boolean':
          return this.buildBoolean(field);
        case 'xsd:double':
        case 'double':
          return this.buildDouble(field);
        case 'xsd:decimal':
        case 'decimal':
          return this.buildDecimal(field);
        case 'xsd:base64Binary':
        case 'base64Binary':
          return this.buildBase64(field);
        case 'WebLink':
          return this.buildWebLink(field);
        default:
          if (options.createImmediateSubObjects) {
            return this.getDataInternal(field.attributeDefinition.SchemaType || field.attributeDefinition.Type, opts)[0];
          } else {
            return null;
          }
      }
    },
    buildUUID: function() {
      return Rally.test.generateUUID();
    },
    buildString: function(field) {
      return Rally.test.generateName();
    },
    buildTime: function(field) {
      return Rally.util.DateTime.toIsoString(new Date());
    },
    buildLong: function(field) {
      return 7;
    },
    buildBoolean: function(field) {
      return true;
    },
    buildDouble: function(field) {
      return 3.14;
    },
    buildDecimal: function(field) {
      return 6.28;
    },
    buildWebLink: function(field) {
      return 'http://www.google.com';
    },
    buildBase64: function(field) {
      return Rally.test.generateName();
    },
    buildRef: function(type, objectID) {
      var ext;
      if (objectID === null) {
        return 'null';
      }
      ext = this.wsapiVersion === 'v2.x' ? '' : '.js';
      return "/" + (type.toLowerCase()) + "/" + objectID + ext;
    },
    buildRefObject: function(type) {
      return {
        _ref: this.buildRef(type, this.getNextObjectID()),
        _type: type,
        _refObjectName: this.buildString()
      };
    },
    buildCollection: function(type, field, datum, options) {
      switch (this.wsapiVersion) {
        case 'v2.x':
          return this.build2xCollection(type, field, datum, options);
        default:
          return this.build1xCollection(type, field, options);
      }
    },
    build1xCollection: function(type, field, options) {
      var fieldType, _ref, _ref1;
      fieldType = ((_ref = field.attributeDefinition) != null ? (_ref1 = _ref.AllowedValueType) != null ? _ref1._refObjectName : void 0 : void 0) || field.attributeDefinition.SchemaType;
      return this.getDataInternal(fieldType, {
        version: options.version,
        count: 3,
        depth: 0
      });
    },
    build2xCollection: function(type, field, datum, options) {
      return {
        _ref: this.buildRef(type, datum.ObjectID) + '/' + field.attributeDefinition.ElementName,
        Count: options.emptyCollections ? 0 : 3
      };
    },
    buildConstrainedValue: function(type, field, options) {
      var allowedValues;
      if (this.wsapiVersion === 'v2.x') {
        if (field.attributeDefinition.AttributeType === 'OBJECT') {
          return this.buildRefObject(field.attributeDefinition.SchemaType);
        } else {
          return this.buildString(field);
        }
      } else {
        return allowedValues = _.pluck(field.allowedValues, 'StringValue')[1];
      }
    },
    getNextObjectID: function() {
      return this.objectID++;
    },
    getModel: function(type) {
      var model;
      if (type.typePath) {
        model = type;
      } else {
        model = Rally.test.mock.data.WsapiModelFactory.getModel(type, this.wsapiVersion);
      }
      return model;
    }
  });

})();
