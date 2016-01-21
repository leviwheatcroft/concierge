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
  }
});


/**
 * ## getConductor
 *
 * most modules in lib are a collection of functions which need to be executed
 * in a particular order, and passed a single directory object and a callback
 *
 * this function creates a function which applies a collection of directories
 * to a collection of functions. directories are processed asynchronously, and
 * fns are applied to each directory in series.
 *
 * see metaMedia.js check() for example
 *
 * @param {(Function|Function[])} fns functions to wrap
 *
 */
getConductor = function(fns, concurrent) {
  if (!_.isArray(fns)) {
    fns = [ fns ];
  }
  if (!concurrent) {
    concurrent = 1;
  } else {
    concurrent = config.concurrentOps;
  }
  return function(directories, callback) {
    if (!_.isArray(directories)) {
      directories = [ directories ];
    }
    async.eachLimit(
      directories,
      concurrent,
      function(directory, nextDirectory) {
        async.eachSeries(
          fns,
          function(fn, nextFn) {
            // console.log('tick');
            fn(directory, nextFn);
          },
          function() {
            // An error thrown to this callback should terminate processing of
            // a single directory. The custom error type handles it's own
            // reporting, so there's no need to pass the error to nextDirectory
            nextDirectory();
          }
        );
      },
      callback
    );
  };
}

/**
 * ## module.exports
 */
module.exports = getConductor;
