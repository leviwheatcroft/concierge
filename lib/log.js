/**
 * ## log module
 *
 * this is actually a pretty good example of how to use the `config` module
 * winston is returned by `module.exports` in it's uninitiated state, then
 * the init function passed to config.push is what actually initialises the
 * winston instance
 */
var config              = require('./config');
var winston             = require('winston');



/**
 * ## config
 * define options specific to this module
 *
 * * concurrentOperations - async concurrency
 */
config.push({
  options: {
    logFile: [
      'l',
      'file to write logs to',
      'file',
      'concierge.log'
    ],
    logLevel: [
      false,
      'log level (silly|debug|info|warn|error)',
      'string',
      'info'
    ]
  },
  validation: function(config) {
    if (!/^(silly|debug|info|warn|error)$/i.exec(config.logLevel)) {
      throw new Error('logLevel invalid: ' + config.logLevel);
    }
  },
  init: function(config) {
    if (config.logFile) {
      winston.add(winston.transports.File, { filename: config.logFile });
    }
    winston.level = config.logLevel;
    winston.throwError = function(msg) {
      winston.error(msg);
      throw msg;
    };
  }
});

module.exports = winston;

