/**
 * ## Contravention module
 *
 * as in contravenes the convention
 *
 * a directory extracted from an nzb should follow certain conventions, like
 * it contains media files, and the name can be extracted from the path, et
 * cetera.
 *
 * when a directorydoesnt match these criteria, throw a contravention ala
 * callback(new Contravention(directory, 'noMedia', 'optional custom message');
 *
 */

/**
 * require & declarations
 */
var log = require('./log.js');
var Contravention;
var defaultMessages;


/**
 * ## defaultMessages
 */
defaultMessages = {
  noMatch: 'tmdb has no matches',
  noMedia: 'directory does not contain media',
  volNum: 'multiple volumes but no volume numbers',
  targetExists: 'the target directory already exists',
  deleted: 'directory has been deleted'
};

/**
 * ## Contravention Class
 * custom error class, will attach itself to specified directory
 *
 * @class
 *
 * @param {Directory} directory Directory instance with contravention
 * @param {string} name name for this contravention, see `defaultMessages`
 * @param {string} message custom message, see `defaultMessages`
 */
Contravention = function(directory, name, message) {
  var match;
  if (!_.contains(_.keys(defaultMessages), name)) {
    match = /\[(\w.*?)\]/.exec(name);
    if (
      (!match) ||
      (!_.contains(_.keys(defaultMessages), match[1]))
    ) {
      log.error(new Error('bad contravention name: ' + name));
    } else {
      name = match[1];
    }
  }
  this.name = name;
  this.message = message || defaultMessages[name];
  this.stack = (new Error()).stack;
  directory.meta.contravention = this;
  log.debug(directory.logName, '| contravention: ', this.message);
}
Contravention.prototype = Object.create(Error.prototype);
Contravention.prototype.constructor = Contravention;

/**
 * ## Contravention.prototype.toJSON
 *
 * the 'meta' property of a directory instance is written to a .meta file for
 * user reference. so when JSON.stringify(directory.meta) is called, it will
 * call this method if an instance of Contravention is present in the method.
 *
 * pretty clever right?
 *
 */
Contravention.prototype.toJSON = function() {
  return '[' + this.name + '] ' + this.message;
};
Contravention.prototype.toString = function() {
  return '[' + this.name + '] ' + this.message;
};

module.exports = Contravention;
