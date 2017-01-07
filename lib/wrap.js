var _ = require('underscore');
var config = require('./config');
var async = require('async');
var os = require('os');



/**
 * ## config
 * define options specific to this module
 *
 * * concurrentOperations - async concurrency
 */
config.push({
  options: {
    concurrentOps: [
      false,
      'concurrency',
      'int',
      os.cpus().length
    ]
  },
  init: function(config) {
  }
});

/**
 * ## wrapConcurrent
 *
 * apply a list of directories to a list of fns
 *
 * each directory will be run through the list of fns sequentially, however
 * the directories will be processed synchronously.
 *
 * the function produced by `wrapConcurrent` accepts a list of directories as
 * first argument, whereas `wrapSeries` accepts only a single directory.
 *
 *  * @param {(Function|Function[])} fns functions to wrap
 */
wrapConcurrent = function(fns) {
  if (!_.isArray(fns)) {
    fns = [ fns ];
  }
  return function(directories, callback) {
    if (!_.isArray(directories)) {
      directories = [ directories ];
    }
    async.eachLimit(
      directories,
      config.concurrentOps,
      function(directory, next) {
        async.eachSeries(
          fns,
          function(fn, next) {
            fn(directory, next);
          },
          next
        );
      },
      callback
    );
  };
};

/**
 * ## wrapSeries
 *
 * apply a directory to a list of fns
 *
 * the function produced by `wrapConcurrent` accepts a list of directories as
 * first argument, whereas `wrapSeries` accepts only a single directory.
 *
 *  * @param {(Function|Function[])} fns functions to wrap
 */
wrapSeries = function(fns) {
  return function(directory, callback) {
    async.eachSeries(
      fns,
      function(fn, next) {
        fn(directory, next);
      },
      callback
    );
  };
};

/**
 * ## module.exports
 */
module.exports = {
  series: wrapSeries,
  concurrent: wrapConcurrent
};
