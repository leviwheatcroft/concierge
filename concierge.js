/**
 * ## concierge.js
 * an entry point for command line usage
 *
 *  - use config.ini and command line arguments
 */

/**
 * ## require & declare
 */
var plugins             = require('./lib/plugins');
var config              = require('./lib/config');
var bootstrap           = require('./lib/bootstrap');
var actions             = require('./lib/actions');

/**
 * ## shebang
 */
(function() {
  var directories = [];
  // load plugins
  plugins.init();
  // load config and process CLI
  config.init({
    fromCli: true,
    fromIni: true
  });
  bootstrap(directories, function() {
    actions(directories, function() {
      // Done
    });
  });
})();
