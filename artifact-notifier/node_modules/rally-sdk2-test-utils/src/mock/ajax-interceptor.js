(function() {

  Ext.define('Rally.test.mock.AjaxInterceptor', {
    /*
     * @property stub A stub of the Ext.Ajax.request function
    */

    /*
     * @property ext2stub A stub of the Ext2 Ext.lib.Ajax.request function
    */

    /*
     * @constructor
     * @param testCase The TestCase instance to mock Ajax requests for.
     * This Test Case must have the sinon.sandbox methods injected into it
    */

    constructor: function(sinonSandbox) {
      this.testCase = sinonSandbox;
      this._mockResponses = [];
      this.callParent(arguments);
      if (Ext.data.Connection.prototype.request.getCall != null) {
        Ext.data.Connection.prototype.request.restore();
      }
      if (Ext.data.JsonP.request.getCall != null) {
        Ext.data.JsonP.request.restore();
      }
    },
    statics: {
      emptyResponses: {
        'GET': {
          "QueryResult": {
            "TotalResultCount": 0,
            "StartIndex": 1,
            "PageSize": 200,
            "Results": [],
            "Errors": [],
            "Warnings": []
          }
        },
        'POST': {
          "OperationResult": {
            "_rallyAPIMajor": "1",
            "_rallyAPIMinor": "34",
            "Errors": [],
            "Warnings": [],
            "Object": {}
          }
        },
        'DELETE': {
          "OperationResult": {
            "_rallyAPIMajor": "1",
            "_rallyAPIMinor": "34",
            "Errors": [],
            "Warnings": []
          }
        },
        'PUT': {
          "CreateResult": {
            "_rallyAPIMajor": "1",
            "_rallyAPIMinor": "34",
            "Errors": [],
            "Warnings": [],
            "Object": {}
          }
        }
      }
    },
    /*
     * Sets up a mock Ajax response returning HTML
     * @param {String} html The HTML to be returned
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Boolean} [options.success=true] Whether the query request should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @param {String} [options.method='GET'] The HTTP request method verb to use. Possible values include: GET, POST, PUT, DELETE
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithHtml: function(html, options) {
      if (options == null) {
        options = {};
      }
      return this._mock(html, options.success, options, options.method || 'GET');
    },
    /*
     * Sets up a mock Ajax response returning JSON
     * @param {Object} json The JSON to be returned
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Boolean} [options.success=true] Whether the query request should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @param {String} [options.method='GET'] The HTTP request method verb to use. Possible values include: GET, POST, PUT, DELETE
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithJson: function(json, options) {
      if (options == null) {
        options = {};
      }
      return this._mock(json, options.success, options, options.method || 'GET');
    },
    /*
     * Sets up a mock response to a WSAPI GET request expecting a collection in return
     * @param {Object} [data=[]] Models and their fields to be returned in the response results
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Array} [options.errors=[]] Errors to be returned due to unsuccessful query
     * @param {Array} [options.warnings=[]] Warnings to be returned despite successful query
     * @param {Boolean} [options.success=true] Whether the query request should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @param {Object} [options.schema] Supply this value to be included as the Schema property of the QueryResult in the response
     * @param {Number} [options.totalResultCount] Supply this value to set the TotalResultCount in the response
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithQueryResult: function(data, options) {
      var response, success;
      if (data == null) {
        data = [];
      }
      if (options == null) {
        options = {};
      }
      response = {
        "QueryResult": {
          "TotalResultCount": options.totalResultCount || data.length,
          "StartIndex": 1,
          "PageSize": 200,
          "Results": data,
          "Errors": options.errors || [],
          "Warnings": options.warnings || []
        }
      };
      if (options.schema) {
        response.QueryResult.Schema = options.schema;
      }
      if (options.sums) {
        response.QueryResult.Sums = options.sums;
      }
      success = this._getSuccess(options);
      return this._mock(response, success, options, 'GET');
    },
    /*
     * Sets up a mock response to a WSAPI POST request to update a single object
     * @param {Object} [data={}] Fields to be returned as the updated model
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Array} [options.errors=[]] Errors to be returned due to unsuccessful update
     * @param {Array} [options.warnings=[]] Warnings to be returned despite successful update
     * @param {Boolean} [options.success=true] Whether the update should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithUpdateResult: function(data, options) {
      var response, success;
      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      response = {
        "OperationResult": {
          "_rallyAPIMajor": "1",
          "_rallyAPIMinor": "34",
          "Errors": options.errors || [],
          "Warnings": options.warnings || [],
          "Object": data
        }
      };
      success = this._getSuccess(options);
      return this._mock(response, success, options, 'POST');
    },
    /*
     * Sets up a mock response to a WSAPI DELETE request to delete a single object
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Array} [options.errors=[]] Errors to be returned due to unsuccessful delete
     * @param {Array} [options.warnings=[]] Warnings to be returned despite successful delete
     * @param {Boolean} [options.success=true] Whether the delete should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithDeleteResult: function(options) {
      var response, success;
      if (options == null) {
        options = {};
      }
      response = {
        "OperationResult": {
          "_rallyAPIMajor": "1",
          "_rallyAPIMinor": "34",
          "Errors": options.errors || [],
          "Warnings": options.warnings || []
        }
      };
      success = this._getSuccess(options);
      return this._mock(response, success, options, 'DELETE');
    },
    /*
     * Sets up a mock response to a WSAPI PUT create request
     * @param {Object} [data={}] Fields to be returned as the created model
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Array} [options.errors=[]] Errors to be returned due to unsuccessful save
     * @param {Array} [options.warnings=[]] Warnings to be returned despite successful save
     * @param {Boolean} [options.success=true] Whether the create should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithCreateResult: function(data, options) {
      var response, success;
      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      response = {
        "CreateResult": {
          "_rallyAPIMajor": "1",
          "_rallyAPIMinor": "34",
          "Errors": options.errors || [],
          "Warnings": options.warnings || [],
          "Object": data
        }
      };
      success = this._getSuccess(options);
      return this._mock(response, success, options, 'PUT');
    },
    /*
     * Sets up a mock response to a WSAPI GET request to read a single object
     * @param {Object} [data={}] Fields to be returned as the read model
     * @param {Object} [options] Optional options to configure aspects about the request/response
     * @param {Array} [options.errors=[]] Errors to be returned due to unsuccessful save
     * @param {Array} [options.warnings=[]] Warnings to be returned despite successful save
     * @param {Boolean} [options.success=true] Whether the create should be considered successful
     * @param {String} [options.url] Supply a value, only if this response should only be used for requests that contain this
     * @return {sinon.stub} The stub function for returning this mocked response
    */

    respondWithReadResult: function(data, options) {
      var capitalizedType, result, type, typeMap, _ref, _ref1;
      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      data = Ext.apply({
        Errors: options.errors || [],
        Warnings: options.warnings || []
      }, data);
      typeMap = {
        attributedefinition: 'AttributeDefinition',
        hierarchicalrequirement: 'HierarchicalRequirement',
        userprofile: 'UserProfile',
        revisionhistory: 'RevisionHistory',
        portfolioitem: 'PortfolioItem',
        testcase: 'TestCase',
        defectsuite: 'DefectSuite',
        testset: 'TestSet',
        task: 'Task'
      };
      type = (_ref = data._type) != null ? _ref : options.type;
      if (type == null) {
        type = 'HierarchicalRequirement';
      }
      type = (_ref1 = typeMap[type]) != null ? _ref1 : type;
      if (type.indexOf('portfolioitem' !== -1)) {
        type = type.replace(/^portfolioitem\//, '');
      }
      capitalizedType = "" + (type[0].toUpperCase()) + (type.slice(1));
      result = {};
      result[capitalizedType] = data;
      return this._mock(result, options.success, options, 'GET');
    },
    /*
     * Prints the method (GET, POST, etc) and URL for all registered mocks.  For debugging tests.
    */

    printMockedCalls: function() {
      console.log('Registered mock ajax method calls:');
      return _.each(this._mockResponses, function(call) {
        return console.log(call.method, call.url);
      });
    },
    /*
     * Prints requests that did not match any registered mocks.  For debugging tests.
     * Requests that don't match any registered mocks return empty responses
    */

    printUnmockedCalls: function() {
      console.log('The following calls did not match any registered mock response:');
      return _.each(this._unmockedCalls, function(call) {
        return console.log(call.method, call.url);
      });
    },
    _mock: function(response, success, options, method, queryParams) {
      var delay, mock, mockConfig, sendResponse, status, _mockResponses,
        _this = this;
      if (success == null) {
        success = true;
      }
      if (options == null) {
        options = {};
      }
      _mockResponses = this._mockResponses;
      delay = options.delay || 1;
      status = options.status != null ? options.status : success ? 200 : 400;
      mockConfig = {
        url: options.url,
        method: method,
        queryParams: queryParams,
        urlMatcher: options.urlMatcher,
        expectedData: options.expectedData,
        bodyMatcher: options.bodyMatcher,
        neverRespond: options.neverRespond,
        delay: delay,
        status: status
      };
      mock = this._findExistingMock(mockConfig);
      if (mock) {
        mock.reinitialize(this.testCase, success, response, mockConfig);
      } else {
        mock = new MockResponse(this.testCase, success, response, mockConfig);
        this._addMockResponse(mock);
      }
      sendResponse = function(config, ext2Options) {
        var callbackMethod, mockResponse, responseText, _ref;
        config.method || (config.method = 'GET');
        mockResponse = _this._getMockResponseForRequest(config);
        if (mockResponse != null) {
          responseText = mockResponse.getResponse(config);
          success = mockResponse.success;
        } else {
          if (_this._unmockedCalls == null) {
            _this._unmockedCalls = [];
          }
          _this._unmockedCalls.push(config);
          responseText = _this._getEmptyResponse(config.method);
        }
        response = {
          status: (_ref = mockResponse != null ? mockResponse.status : void 0) != null ? _ref : 404,
          responseText: responseText,
          argument: {
            options: ext2Options
          }
        };
        callbackMethod = success ? config.success : config.failure;
        if (!(mockResponse != null ? mockResponse.neverRespond : void 0)) {
          Ext.callback(callbackMethod, config.scope, [response, config], mockResponse != null ? mockResponse.delay : void 0);
        }
        if (!ext2Options) {
          success = mockResponse ? mockResponse.success : true;
          if (!(mockResponse != null ? mockResponse.neverRespond : void 0)) {
            return Ext.callback(config.callback, config.scope, [config, success, response], mockResponse != null ? mockResponse.delay : void 0);
          }
        }
      };
      if (!this.ext4Stub) {
        this.stub = this.ext4Stub = this.testCase.stub(Ext.Ajax, 'request', sendResponse);
      }
      if (this.ext4JsonPStub == null) {
        this.ext4JsonPStub = this.testCase.stub(Ext.data.JsonP, 'request', sendResponse);
      }
      return mock.getResponse;
    },
    restoreStub: function() {
      var _ref, _ref1, _ref2;
      if ((_ref = this.ext4Stub) != null) {
        _ref.restore();
      }
      this.ext4Stub = null;
      if ((_ref1 = this.ext4JsonPStub) != null) {
        _ref1.restore();
      }
      this.ext4JsonPStub = null;
      if ((_ref2 = this.ext2Stub) != null) {
        _ref2.restore();
      }
      this.ext2Stub = null;
      return this.removeAllMockResponses();
    },
    removeAllMockResponses: function() {
      return this._mockResponses = [];
    },
    removeMockResponse: function(config) {
      return Ext.each(this._mockResponses, function(_mockResponse, i) {
        if (_mockResponse.matchesRequest(config)) {
          this._mockResponses.splice(i, 1);
          return false;
        }
      }, this);
    },
    _findExistingMock: function(mock) {
      var matchesData;
      matchesData = function(mock, response) {
        if ((mock.expectedData != null) || (response.expectedData != null)) {
          return _.isEqual(response.expectedData, mock.expectedData);
        } else {
          return true;
        }
      };
      return _.find(this._mockResponses, function(response) {
        return response.url === mock.url && response.method === mock.method && matchesData(mock, response);
      });
    },
    _addMockResponse: function(mock) {
      this._mockResponses.push(mock);
      return this._mockResponses.sort(function(a, b) {
        return b.url.length - a.url.length;
      });
    },
    _getMockResponseForRequest: function(config) {
      var mockResponse;
      mockResponse = null;
      _.each(this._mockResponses, function(_mockResponse) {
        if (_mockResponse.matchesRequest(config)) {
          mockResponse = _mockResponse;
          return false;
        }
      });
      return mockResponse;
    },
    _getEmptyResponse: function(method) {
      return Ext.encode(Rally.test.mock.AjaxInterceptor.emptyResponses[method]);
    },
    _getSuccess: function(options) {
      if (options.success != null) {
        return options.success;
      } else {
        return !Ext.isArray(options.errors);
      }
    }
  });

  MockResponse = (function() {
    function MockResponse(testCase, success, response, config) {
      if (config == null) {
        config = {};
      }
      this.reinitialize(testCase, success, response, config);
    }

    MockResponse.prototype.reinitialize = function(testCase, success, response, config) {
      if (config == null) {
        config = {};
      }
      this.success = success;
      this.url = config.url;
      this.method = config.method;
      this.queryParams = config.queryParams;
      this.urlMatcher = config.urlMatcher;
      this.expectedData = config.expectedData;
      this.bodyMatcher = config.bodyMatcher;
      this.getResponse = testCase.stub().returns(Ext.isString(response) ? response : Ext.JSON.encode(response));
      this.neverRespond = config.neverRespond;
      this.delay = config.delay;
      return this.status = config.status;
    };

    MockResponse.prototype.matchesRequest = function(config) {
      return this._matchesUrl(config.url) && this._matchesMethod(config) && this._matchesBody(config);
    };

    MockResponse.prototype._matchesUrl = function(url) {
      if (this.urlMatcher) {
        return this.urlMatcher(this.url, url);
      }
      return !!(url.split('?')[0]).toLowerCase().match(new RegExp(this.url.toLowerCase() + 's*(\.js|\.sp)?$'));
    };

    MockResponse.prototype._matchesMethod = function(config) {
      var _ref;
      return this.method === config.method || this.method === ((_ref = config.params) != null ? _ref._method : void 0);
    };

    MockResponse.prototype._matchesBody = function(config) {
      if (this.bodyMatcher != null) {
        return this.bodyMatcher(config.jsonData);
      } else {
        return true;
      }
    };

    return MockResponse;

  })();

})();
