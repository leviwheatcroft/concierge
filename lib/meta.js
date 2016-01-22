/**
 * ## meta module
 */

/**
 * ## require & declarations
 */
var path                = require('path');
var fs                  = require('./fs');
var log                 = require('./log');
var config              = require('./config');
var Contravention       = require('./Contravention');

var store;
var retrieve;

/**
 * ## config
 *  deal with configuration options specific to this module
 *
 * * noMeta - do not store meta on hard drive
 */
config.push({
  options: {
    noMeta: [
      false,
      'don\'t write meta to hard drive',
      'true'
    ]
  }
});

/**
 * ## store
 * writes meta to `.meta` file.
 * If you want to store something in meta, make sure it's either readily
 * convertible to a string, or that it has a `toJSON` method
 *
 * @param {Directory} directory
 * @param {function} callback
 */
store = function(directory, callback) {
  if (config.noMeta) {
    callback();
    return;
  }
  if (directory.hasError('deleted')) {
    log.debug(directory.logName, '| can not store meta in deleted directory');
    callback();
    return;
  }
  fs.writeFile(
    path.join(directory.path, '.meta'),
    JSON.stringify(directory.meta, null, ' '),
    function(err) {
      log.debug(directory.logName, '| stored meta');
      if (err) {
        log.debug(err);
      }
      callback();
    }
  );

};

/**
 * ## retrieve
 * retrieve meta from `.meta` file
 *
 * @param {Directory} directory
 * @param {function} callback
 */
retrieve = function(directory, callback) {
  fs.readFile(
    path.join(directory.path, '.meta'),
    function(err, data) {
      if (err) {
        log.debug(directory.logName, '| no meta present');
        callback();
        return;
      }
      log.debug(directory.logName, '| found meta');
      try {
        data = JSON.parse(data);
      } catch (e) {
        // something wrong with `.meta` file
        log.debug(directory.logName, '| error in .meta');
        callback();
        return;
      }
      _.defaults(
        directory.meta,
        data
      );

      // a contravention which is a string will have come from the .meta file
      // this means contraventions which are already set will not be set
      // initialized again
      if (
        (directory.meta.contravention) &&
        (_.isString(directory.meta.contravention))
      ) {
        new Contravention(
          directory,
          directory.meta.contravention
        );
      }
      callback();
    }
  );
};

/**
 * ## module.exports
 */
module.exports = {
  store: store,
  retrieve: retrieve
};
