/**
 * ## index.js
 * an entry point for module based usage
 *
 *  - doesn't use config.ini
 *  - no command line options
 */

/**
 * ## require & declare
 */
var plugins             = require('./lib/plugins');
var config              = require('./lib/config');
var bootstrap           = require('./lib/bootstrap');
var actions             = require('./lib/actions');

/**
 * ## module.exports
 *
 * @param {Object} options
 */
module.exports = function(options) {
  // load plugins
  plugins.init();
  // load config and process CLI
  config.init(_.extend(options, {
    fromCli: false,
    fromIni: false
  }));
  bootstrap(directories, function() {
    actions(directories, function() {
      // Done
    });
  });
};
