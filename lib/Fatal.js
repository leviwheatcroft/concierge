/**
 * ## Fatal module
 *
 * a convenient error which does some stuff before throwing.
 *
 */

/**
 * require & declarations
 */
var log                 = require('./log');
var config              = require('./config');

var Fatal;

/**
 * ## config
 *  deal with configuration options specific to this module
 */
config.push({
  options: {
  },
  validation: function(config) {
  },
  init: function(config) {
  }
});

/**
 * ## Fatal Class
 * custom error class
 *
 * this error is not really designed to be called with `throw
 *
 * @class
 *
 * @param {Directory} directory Directory instance with contravention
 * @param {string} name name for this contravention, see `defaultMessages`
 * @param {string} message custom message, see `defaultMessages`
 */
Fatal = function(message) {
  var match;
  this.name = 'fatal error';
  this.message = message || 'some fatal error';
  this.stack = (new Error()).stack;

  log.error('fatal error thrown');
  log.error(message);
  log.error(this.stack);
  process.exit();
}
Fatal.prototype = Object.create(Error.prototype);
Fatal.prototype.constructor = Fatal;


/**
 * ## Fatal.prototype.toJSON
 *
 * the 'meta' property of a directory instance is written to a .meta file for
 * user reference. so when JSON.stringify(directory.meta) is called, it will
 * call this method if an instance of Fatal is present in the method.
 *
 * pretty clever right?
 *
 */
Fatal.prototype.toJSON = function() {
  return '[' + this.name + '] ' + this.message;
};
Fatal.prototype.toString = function() {
  return '[' + this.name + '] ' + this.message;
};

module.exports = Fatal;
