(function() {

    Ext.define('Rally.test.Generator', {
        singleton: true,

        generateNumber: function() {
            return Math.floor(Math.random()*11111111);
        },

        generateName: function() {
            return 'gen' + this.generateNumber();
        },

        generateUUID: function() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return uuid;
        }
    }, function() {
      Rally.test.generateNumber = function() {
        return Rally.test.Generator.generateNumber();
      };

      Rally.test.generateName = function() {
        return Rally.test.Generator.generateName();
      };

      Rally.test.generateUUID = function() {
        return Rally.test.Generator.generateUUID();
      };
    });
})();
