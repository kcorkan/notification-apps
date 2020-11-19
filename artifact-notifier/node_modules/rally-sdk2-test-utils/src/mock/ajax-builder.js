(function() {

  /**
  * Helps mock out HTML and WSAPI Ajax requests for testing components without a running server.
  * RallyTestCase automatically creates an instance for each test and can be found
  * in the TestCase as *this.ajax*.
  *
  * Example of mocking out WSAPI queries
  *
  *     @example
  *     this.ajax.whenQuerying('userstory').respondWith([{
  *         ObjectID: 12345,
  *         _ref: '/hierarchicalrequirement/12345',
  *         Name: 'As a user, the site should be awesome, so that I can get my job done'
  *     }])
  *
  *     var dataStore = Ext.create('Rally.data.wsapi.Store', {
  *         model: 'userstory',
  *         autoLoad: true
  *     })
  *     Assert.areEqual(1, dataStore.getCount())
  *     Assert.areEqual(12345, dataStore.first.get('ObjectID')
  */


  Ext.define('Rally.test.mock.AjaxBuilder', {
    mixins: {
      snapshot: 'Rally.test.mock.SnapshotAjaxBuilder'
    },
    config: {
      type: void 0,
      url: void 0,
      verb: void 0,
      httpMethod: null,
      expectedData: void 0,
      objectID: void 0,
      singleObjectResponse: false,
      notWsapi: false,
      allowedValues: false,
      allowedQueryOperators: false
    },
    constructor: function(ajaxInterceptor) {
      this.ajaxInterceptor = ajaxInterceptor;
    },
    /**
    * Returns the stubbed AjaxInterceptor request function
    * @return {sinon.stub}
    */

    getStub: function() {
      return this.ajaxInterceptor.stub;
    },
    applyType: function(value) {
      return this._coerceType(value);
    },
    applyUrl: function(value) {
      return this._coerceType(value);
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock REST call to an External Service
    * @param {String} type The relative url of the service being called
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock REST queries for the given type
    */

    whenQueryingFromExternalService: function(url, options) {
      var builder, _ref;
      if (options == null) {
        options = {};
      }
      builder = this._when(url, 'queryexternalservice');
      builder.setNotWsapi(true);
      builder.setHttpMethod((_ref = options.method) != null ? _ref : 'GET');
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI queries
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI queries for the given type
    */

    whenQuerying: function(type) {
      return this._when(type, 'query');
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI queries
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @param {String} fieldName The name of the collection field
    * @return {AjaxBuilder} A new instance configured to mock WSAPI queries for the given type
    */

    whenQueryingCollection: function(type, objectID, fieldName) {
      var builder;
      builder = this._when(type, 'queryCollection', fieldName);
      builder.setObjectID(objectID);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI AllowedValue queries
    * @param {String/Rally.data.wsapi.Field} type The name of a Rally WSAPI model type (e.g. 'userstory')
    *   or the field
    * @param {String} [fieldName] The name of the field if the first param is the model type
    * @return {AjaxBuilder} A new instance configured to mock WSAPI queries for the given type
    */

    whenQueryingAllowedValues: function(type, fieldName) {
      var builder;
      builder = this._when(type, 'query', fieldName);
      builder.setAllowedValues(true);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI AllowedQueryOperator queries
    * @param {String/Rally.data.wsapi.Field} type The name of a Rally WSAPI model type (e.g. 'userstory')
    *   or the field
    * @param {String} [fieldName] The name of the field if the first param is the model type
    * @return {AjaxBuilder} A new instance configured to mock WSAPI queries for the given type
    */

    whenQueryingAllowedQueryOperators: function(type, fieldName) {
      var builder;
      builder = this._when(type, 'query', fieldName);
      builder.setAllowedQueryOperators(true);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock endpoint GET requests.
    * These requests are not tied to models and the responses can be of any shape.
    * @param {String} type The endpoint URL
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock endpoint GET requests
    */

    whenQueryingEndpoint: function(type, wsapiResponse) {
      var builder;
      if (wsapiResponse == null) {
        wsapiResponse = false;
      }
      builder = this._when(type, 'queryEndpoint');
      builder.setNotWsapi(!wsapiResponse);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI reads for single object
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @param {String/Number} objectID The unique identifier for the object to be read
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI reads for the given type
    */

    whenReading: function(type, objectID) {
      var builder;
      builder = this._when(type, 'read');
      builder.setObjectID(objectID);
      builder.setSingleObjectResponse(true);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock endpoint GET requests.
    * These requests are not tied to models and the responses can be of any shape.
    * @param {String} type The endpoint URL
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock endpoint GET requests
    */

    whenReadingEndpoint: function(type, wsapiResponse) {
      var builder;
      if (wsapiResponse == null) {
        wsapiResponse = false;
      }
      builder = this._when(type, 'readEndpoint');
      builder.setNotWsapi(!wsapiResponse);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock endpoint GET requests.
    * These requests are not tied to models and the responses can be of any shape.
    * @param {String} type The endpoint URL
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock endpoint GET requests
    */

    whenUpdatingEndpoint: function(type, wsapiResponse) {
      var builder;
      if (wsapiResponse == null) {
        wsapiResponse = false;
      }
      builder = this._when(type, 'updateEndpoint');
      builder.setNotWsapi(!wsapiResponse);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI creates
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI creates for the given type
    */

    whenCreating: function(type, wsapiResponse) {
      var builder;
      if (wsapiResponse == null) {
        wsapiResponse = true;
      }
      builder = this._when(type, 'create');
      builder.setSingleObjectResponse(true);
      builder.setNotWsapi(!wsapiResponse);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI updates of a single object
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @param {String/Number} objectID The unique identifier for the object to be updated
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI updates for the given type
    */

    whenUpdating: function(type, objectID, wsapiResponse) {
      var builder;
      if (wsapiResponse == null) {
        wsapiResponse = true;
      }
      if (objectID == null) {
        throw new Error('AjaxBuilder.whenUpdating, objectID parameter is required');
      }
      builder = this._when(type, 'update');
      builder.setObjectID(objectID);
      builder.setSingleObjectResponse(true);
      builder.setNotWsapi(!wsapiResponse);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI batch updates
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI batch updates
    */

    whenBatchUpdating: function() {
      var builder;
      builder = this._when('hierarchicalrequirement', 'batchUpdate', '/batch');
      builder.setNotWsapi(true);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI updates to a collection field of a single object
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @param {String/Number} objectID The unique identifier for the object to be updated
    * @param {String} fieldName The name of the collection field
    * @param {String} endpoint The name of the endpoint (add/remove)
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI updates for the given type
    */

    whenUpdatingCollection: function(type, objectID, fieldName, endpoint) {
      var builder;
      if (endpoint == null) {
        endpoint = 'add';
      }
      if (objectID == null) {
        throw new Error('AjaxBuilder.whenUpdatingCollection, objectID parameter is required');
      }
      builder = this._when(type, 'updateCollection', fieldName);
      builder.endpoint = endpoint;
      builder.setObjectID(objectID);
      builder.setSingleObjectResponse(false);
      return builder;
    },
    /**
    * Creates a new instance of an AjaxBuilder setup to mock WSAPI deletes of single object
    * @param {String} type The name of a Rally WSAPI model type (e.g. 'userstory')
    * @param {String/Number} objectID The unique identifier for the object to be deleted
    * @return {Rally.test.mock.AjaxBuilder} A new instance configured to mock WSAPI deletes for the given type
    */

    whenDeleting: function(type, objectID, wsapiResponse) {
      var builder;
      if (wsapiResponse == null) {
        wsapiResponse = true;
      }
      if (objectID == null) {
        throw new Error('AjaxBuilder.whenDeleting, objectID parameter is required');
      }
      builder = this._when(type, 'delete');
      builder.setObjectID(objectID);
      builder.setNotWsapi(!wsapiResponse);
      return builder;
    },
    /**
    * Tells the mock it must contain the data in this json body before it is consider matching a previously created mock
    */

    withJsonData: function(expectedData) {
      this.setExpectedData(expectedData);
      return this;
    },
    /**
    * Provides a successful response for the mocked-out Ajax request
    * @param {Array/Object} [results] Objects to be returned in the response.
    * For queries, this should be an Array and defaults to an empty Array.
    * For reads and updates, this should be a single Object and defaults to an empty Object.
    * For deletes, this parameter should not be used
    * @param {Object} [options]
    * @param {Boolean} [options.delay] If true, the ajax response with be asynchronous.
    * @param {Object} [options.schema] Supply this value to be included as the Schema property of the QueryResult in the response
    * @return {sinon.stub} The stub  for returning this mocked response
    */

    respondWith: function(results, options) {
      var count;
      if (results == null) {
        results = [];
      }
      if (options == null) {
        options = {};
      }
      if (Ext.isObject(results) && !this.getNotWsapi()) {
        results = [results];
      }
      options.values = results;
      count = results.length;
      if (this.getSingleObjectResponse()) {
        count = 1;
      }
      return this.respondWithCount(count, options);
    },
    neverRespond: function() {
      return this._respondWith(null, {
        neverRespond: true
      });
    },
    respondWithCount: function(count, options) {
      var attributeDefinition, field, me, mock, modelType, objectID, results, type, url, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      me = this;
      type = this.getType();
      modelType = type;
      url = this.getUrl();
      results;
      if (this.getNotWsapi() || (typeof url.indexOf === "function" ? url.indexOf('user:current/permissions/all') : void 0) > -1) {
        results = options.values;
      } else if (this.getAllowedValues()) {
        modelType = 'AllowedAttributeValue';
        field = type.getAllowedValuesRef != null ? type : Rally.test.mock.data.WsapiModelFactory.getModel(type).getField(url);
        this.setUrl(field.getAllowedValuesRef());
        options.withRefs = field.attributeDefinition.AllowedValueType;
        if (options.values) {
          options.values = _.map(options.values, function(value) {
            if (Ext.isObject(value)) {
              return value;
            } else {
              return {
                StringValue: value
              };
            }
          });
        }
        results = Rally.test.mock.ModelObjectMother.getData(modelType, Ext.applyIf(options, {
          count: count
        }));
      } else if (this.getAllowedQueryOperators()) {
        modelType = 'AllowedQueryOperator';
        field = type.getAllowedQueryOperatorsRef != null ? type : Rally.test.mock.data.WsapiModelFactory.getModel(type).getField(url);
        this.setUrl(field.getAllowedQueryOperatorsRef());
        options.withRefs = field.attributeDefinition.AllowedQueryOperators;
        if (options.values) {
          options.values = _.map(options.values, function(value) {
            if (Ext.isObject(value)) {
              return value;
            } else {
              return {
                OperatorName: value
              };
            }
          });
        }
        results = Rally.test.mock.ModelObjectMother.getData(modelType, Ext.applyIf(options, {
          count: count
        }));
      } else {
        if (url !== type) {
          attributeDefinition = Rally.test.mock.data.WsapiModelFactory.getModel(type).getField(Ext.String.capitalize(url)).attributeDefinition;
          modelType = ((_ref = attributeDefinition.AllowedValueType) != null ? _ref._refObjectName : void 0) || attributeDefinition.SchemaType;
        }
        objectID = this.getObjectID();
        if (objectID != null) {
          if (!((_ref1 = options.values) != null ? _ref1.length : void 0)) {
            options.values = [{}];
          }
          if (url === type) {
            this._setIdAndRef(type, options.values[0], objectID);
          }
        }
        results = Rally.test.mock.ModelObjectMother.getData(modelType, Ext.applyIf(options, {
          count: count
        }));
      }
      if (this.getSingleObjectResponse()) {
        results = results[0];
      }
      mock = this._respondWith(results, options);
      mock.data = results;
      if (!this.getNotWsapi()) {
        mock.getRecord = function(index) {
          var Model, result;
          if (index == null) {
            index = 0;
          }
          Model = Rally.test.mock.data.WsapiModelFactory.getModel(type);
          result = me.getSingleObjectResponse() ? results : results[index];
          return new Model(result);
        };
        mock.getRecords = function() {
          return Ext.Array.map(results, function(result) {
            var Model;
            Model = Rally.test.mock.data.WsapiModelFactory.getModel(type);
            return new Model(result);
          });
        };
      }
      return mock;
    },
    /**
    * Provides an unsuccessful response for the mocked-out Ajax request
    * @param {Array/String} errors One or more errors to be returned in the response
    * @return {sinon.stub} The stub  for returning this mocked response
    */

    errorWith: function(errors) {
      if (Ext.isString(errors)) {
        errors = [errors];
      }
      return this.respondWith([], {
        errors: errors
      });
    },
    _respondWith: function(results, options) {
      var endpoint, expectedData, interceptorFn, objectID, type, url, urlSuffix, wsapiVersion,
        _this = this;
      if (options == null) {
        options = {};
      }
      wsapiVersion = Rally.test.mock.data.WsapiModelFactory.getModelClassVersion(options.version);
      url = this.getUrl();
      objectID = this.getObjectID();
      urlSuffix = wsapiVersion === 'v2.x' ? '' : '.js';
      switch (this.getVerb()) {
        case 'queryexternalservice':
          if (url != null) {
            options.url = "" + url + urlSuffix;
          }
          options.method = this.getHttpMethod();
          options.urlMatcher = this._urlMatcher;
          expectedData = this.getExpectedData();
          if (expectedData != null) {
            options.bodyMatcher = function(actualData) {
              return _this._bodyMatcher(expectedData, actualData);
            };
            options.expectedData = expectedData;
          }
          interceptorFn = 'respondWithJson';
          break;
        case 'query':
          if (url != null) {
            options.url = "" + url + urlSuffix;
          }
          options.method = 'GET';
          interceptorFn = 'respondWithQueryResult';
          break;
        case 'queryCollection':
          type = this.getType();
          if (url != null) {
            options.url = "" + type + "/" + objectID + "/" + url + urlSuffix;
          }
          options.method = 'GET';
          interceptorFn = 'respondWithQueryResult';
          break;
        case 'read':
          options.url = url;
          if (objectID != null) {
            options.url += '/' + objectID;
          }
          options.url += urlSuffix;
          options.method = 'GET';
          interceptorFn = 'respondWithReadResult';
          break;
        case 'create':
          options.url = "" + url + "/create" + urlSuffix;
          options.method = 'PUT';
          interceptorFn = 'respondWithCreateResult';
          break;
        case 'update':
          options.url = "" + url + "/" + objectID + urlSuffix;
          options.method = 'POST';
          interceptorFn = 'respondWithUpdateResult';
          break;
        case 'updateCollection':
          type = this.getType();
          endpoint = this.endpoint;
          options.url = "" + type + "/" + objectID + "/" + url + "/" + endpoint + urlSuffix;
          options.method = 'POST';
          interceptorFn = 'respondWithUpdateResult';
          break;
        case 'delete':
          options.url = "" + url + "/" + objectID + urlSuffix;
          options.method = 'DELETE';
          results = options;
          interceptorFn = 'respondWithDeleteResult';
          break;
        case 'queryEndpoint':
          options.url = url;
          options.method = 'GET';
          options.urlMatcher = this._urlMatcher;
          interceptorFn = 'respondWithQueryResult';
          break;
        case 'readEndpoint':
          options.url = url;
          options.method = 'GET';
          options.urlMatcher = this._urlMatcher;
          interceptorFn = 'respondWithReadResult';
          break;
        case 'updateEndpoint':
          options.url = url;
          options.method = 'POST';
          options.urlMatcher = this._urlMatcher;
          interceptorFn = 'respondWithUpdateResult';
          break;
        case 'batchUpdate':
          options.url = url;
          options.method = 'POST';
          options.urlMatcher = this._urlMatcher;
          interceptorFn = 'respondWithJson';
      }
      return this.ajaxInterceptor[interceptorFn](results, options);
    },
    /**
    * Directly responds with an HTML response
    * @param {String} html The HTML response to be returned
    * @param {Object} [options] Optional options to configure aspects about the request/response
    * @param {Boolean} [options.success=true] Whether the query request should be considered successful
    * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
    * @param {String} [options.method='GET'] The HTTP request method verb to use. Possible values include: GET, POST, PUT, DELETE
    * @return {*}
    */

    respondWithHtml: function(html, options) {
      return this.ajaxInterceptor.respondWithHtml(html, options);
    },
    respondWithString: function(str) {
      var options;
      options = {
        method: 'GET',
        url: this.getUrl()
      };
      return this.ajaxInterceptor.respondWithHtml(str, options);
    },
    _when: function(type, verb, url) {
      var builder;
      if (url == null) {
        url = type;
      }
      builder = Ext.create('Rally.test.mock.AjaxBuilder', this.ajaxInterceptor);
      builder.setType(type);
      builder.setUrl(url);
      builder.setVerb(verb);
      return builder;
    },
    _setIdAndRef: function(type, obj, id) {
      obj.ObjectID = id;
      return obj._ref = "/" + type + "/" + id;
    },
    _coerceType: function(value) {
      if (value == null) {
        value = '';
      }
      if ((typeof value.toLowerCase === "function" ? value.toLowerCase() : void 0) === 'userstory') {
        return 'hierarchicalrequirement';
      } else {
        return value;
      }
    },
    _urlMatcher: function(url1, url2) {
      return (url2 || '').toLowerCase().indexOf((url1 || '').toLowerCase()) !== -1;
    },
    _bodyMatcher: function(expectedData, actualData) {
      var k, v;
      if (actualData == null) {
        actualData = {};
      }
      for (k in expectedData) {
        v = expectedData[k];
        if (actualData[k] !== expectedData[k]) {
          return false;
        }
      }
      return true;
    },
    /*
     * Prints requests that did not match any registered mocks.  For debugging tests.
     * Requests that don't match any registered mocks return empty responses
    */

    printUnmockedCalls: function() {
      return this.ajaxInterceptor.printUnmockedCalls();
    },
    /*
     * Prints the method (GET, POST, etc) and URL for all registered mocks.  For debugging tests.
    */

    printMockedCalls: function() {
      return this.ajaxInterceptor.printMockedCalls();
    }
  });

})();
