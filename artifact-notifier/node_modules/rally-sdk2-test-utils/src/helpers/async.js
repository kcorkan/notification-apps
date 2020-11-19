(function(jasmine) {

  var jasmineEnv = jasmine.getEnv();
  var jasmineGlobal = jasmine.getGlobal();

  function waitForSpec(spec) {
    return function(done) {
      var promise = spec.call(this);
      if (!promise || !promise.then) {
        throw new Error('pit() tests must return a promise');
      }
      promise.then({
        success: done,
        failure: done
      });
    }
  }

  function checkPredicate(predicate) {
    return !!predicate.call();
  }

  jasmineGlobal.pit = function pit(specName, spec) {
    return jasmineEnv.it(specName, waitForSpec(spec));
  };

  jasmineGlobal.fpit = function fpit(specName, spec) {
    return jasmineEnv.fit(specName, waitForSpec(spec));
  };

  jasmineGlobal.xpit = function xpit(specName, spec) {
    return jasmineEnv.xit(specName, waitForSpec(spec));
  };

  jasmineGlobal.once = function once(predicate) {
    var deferred = Ext.create('Deft.Deferred');

    function loop() {
      if (checkPredicate(predicate)) {
          deferred.resolve();
        } else {
          setTimeout(loop, 100);
        }
    }

    setTimeout(loop, 100);
    return deferred.promise;
  };

  jasmineGlobal.onceCalled = function onceCalled(stubFn, times) {
    times = times || 1;
    return this.once(function() { return stubFn.callCount >= times });
  };

  jasmineGlobal.onceFired = function onceFired(cmp, evt) {
    var eventStub = sinon.stub();
    cmp.on(evt, eventStub, null, {single: true});
    return this.onceCalled(eventStub);
  };

})(jasmine);
