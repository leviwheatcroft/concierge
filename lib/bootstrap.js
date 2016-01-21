// require the things
var path                = require('path');
var async               = require('async');
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
      'file'
    ],
    target: [
      't',
      'target directory (overrides parent)',
      'file'
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
 */
bootstrap = function(directories, callback) {
  var directory;
  // load plugins
  plugins.init();
  // load config and process CLI
  config.init();
  log.debug('initialized config');

  if (config.target) {
    // `config.target` means we're processing a single directory
    directory = new fsItems.Directory({
      path: config.target
    });
    directories.push(directory);
    directory.getChildren(callback);
    log.info(directory.logName, '| got files');
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
      callback: callback
    });
  }
};

module.exports = bootstrap;
