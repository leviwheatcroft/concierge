/**
 * ## move module
 */

/**
 * ## require & declaration
 */
var _                   = require('underscore');
var fs                  = require('./fs.js');
var async               = require('async');
var config              = require('./config');
var log                 = require('./log.js');
var getConductor        = require('./getConductor.js');
var Contravention       = require('./Contravention');

var validate;
var move;

/**
 * ## config
 * module uses ignoreCache which is defined in `./config.js` because it's
 * used in other modules also.
 * no config required for this module
 */


/**
 * ## validate
 * check whether or not we can action this directory
 *
 */
validate = function(directory, callback) {
  if (directory.hasError()) {
    callback(directory.meta.contravention);
    return;
  }
  if (fs.existsSync(directory.getOutputPath())) {
    callback(new Contravention(directory, 'targetExists'));
    return;
  }
  callback();
};

/* ===================================================================== move ==
 *
 *
 *
 */
move = function(directory, callback) {
  var selection;
  var dirPath;

  selection = _.omit(directory.children, function(file) {
    return _.contains(['junk', 'subdirectory'], file.type);
  });
  log.debug(directory.logName, '| append .temp to dir');
  directory.mvToTemp(function() {
    directory.createOutputPath();
    async.each(selection, function(file, next) {
      log.info(file.logName, '| moving');
      file.mvToOutput(next);
    }, function() {
      log.debug(directory.logName, '| purge remnants');
      directory.mvToOutput(callback);
    });
  });
}

module.exports = getConductor([
  validate,
  move
]);
