(function() {

  var testDiv;

  beforeEach(function() {
    testDiv = Ext.DomHelper.append(Ext.getBody(), '<div id="testDiv" style="margin:10px; min-height: 400px"/>');
  });

  afterEach(function() {
    testDiv.remove();
    testDiv = null;
  });

})();
