/**
 * ## concierge.js
 * an entry point for command line usage
 *
 *  - use config.ini and command line arguments
 */

/**
 * ## require & declare
 */
var Promise             = require('bluebird');
var actions             = require('./lib/actions');
var bootstrap           = require('./lib/bootstrap');
var config              = require('./lib/config');
var plugins             = require('./lib/plugins');

/**
 * ## shebang
 */
(function() {
  var directories = [];
  // create queue
  Promise.resolve()
  // load plugins
  .then(function() {
    plugins.init()
  })
  // load config and process CLI
  .then(function() {
    return config.init({
      fromCli: true,
      fromIni: true
    });
  })
  // run defined action
  .then(function() {
    actions[config.action]();
  })
  .catch(function(e) {
    console.log('some catastrophic error occurred');
    console.log(e);
  });

})();
