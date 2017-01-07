// require the things
var path                = require('path');
var async               = require('async');
var Promise             = require('bluebird');
var _                   = require('./underscore.js');
var config              = require('./config');
var fsItems             = require('./fsItems.js');
var log                 = require('./log.js');
var Walker              = require('./walkDepth.js');
var plugins             = require('./plugins.js');


// declaration
var bootstrap;

/**
 * ## config
 * define options specific to this module
 *
 * * parent - if specified, all direct children will be processed
 * * target - if specified, only that directory will be processed, parent will
 *    be ignored.
 */
config.push({
  options: {
    parent: [
      'p',
      'parent directory (will process children)',
      'string'
    ],
    target: [
      't',
      'target directory (overrides parent)',
      'string'
    ]
  },
  defaults: {
    parent: false,
    target: false
  },
  validation: function(config) {
    if (!config.parent && !config.target) {
      log.throwError('specify at least one of --parent or --target');
    }
  }
});

/**
 * ## bootstrap
 * this is where we gather the directories and their children according to the
 * specified target or parent
 *
 * @param {Directory[]} directories
 * @param {function} callback
 * @return {promise}
 */
bootstrap = function(directories) {
  return new Promise(function(resolve, reject) {
    var directory;

    if (config.target) {
      // `config.target` means we're processing a single directory
      directory = new fsItems.Directory({
        path: config.target
      });
      directories.push(directory);
      log.info(directory.logName, '| got files');
      directory.getChildren(resolve);
    } else if (config.parent) {
      // `config.target` means we're processing children
      new Walker(config.parent, {
        maxDepth: 0,
        on: {
          directory: function(parent, child, stat, next) {
            var directory;
            directory = new fsItems.Directory({
              path: path.join(parent, child),
              stat: stat
            });
            log.info(directory.logName, '| got files');
            directories.push(directory);
            directory.getChildren(next);
          }
        },
        callback: function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      });
    }
  });
};

module.exports = bootstrap;
