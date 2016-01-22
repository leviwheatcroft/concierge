_ = require('underscore');

(function() {
  _.mixin({

    /**
     * ## collate
     * returns an object with properties being an array of the values of those
     * properties on the objects passed in
     *
     * ```js
     * _.collate({ a: 1, b: 3 }, { a: 2, b: 4 });
     * => { a: [1, 2], b: [3, 4] }
     * ```
     *
     * @param {Object} target
     * @param {...Object} item Objects to collate
     */
    collate: function(collated, item) {
      var args;

      args = Array.prototype.slice.call(arguments);
      // ditch collated
      args.shift();
      _.each(args, function(arg) {
        _.each(arg, function(value, key) {
          if (collated[key] === undefined) {
            collated[key] = [];
          }
          collated[key].push(value);
        });
      });

      return collated;
    },
    /**
     * ## compactObject
     * like compact but for objects, falsy values are omitted
     *
     *
     *
     * @param {Object} target
     */
    compactObject: function(target) {
      var compacted = {};
      _.each(target, function(value, key) {
        if (value !== null) {
          compacted[key] = value;
        }
      });
      return compacted;
    }
  });
})();

module.exports = _;
