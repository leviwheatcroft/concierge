/**
 * ## conciergeSabnzbd.js
 * an entry point for sab post processing
 *
 *  - no command line configuration
 *  - arguments are from sab
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
    target: process.argv[2],
    fromCli: false,
    fromIni: true
  });
  bootstrap(directories, function() {
    actions(directories, function() {
      // close knex pool
      process.exit();
      // Done
    });
  });
})();
