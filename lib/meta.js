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
var db                  = require('./db');

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
      'don\'t store or retrieve',
      'true'
    ],
    noCache: [
      false,
      'ignore cached meta',
      'true'
    ],
    storageMethod: [
      false,
      'where to store meta (file|db)',
      'string',
      'db'
    ]
  },
  validation: function(config) {
    if (
      (config.storageMethod != 'db') &&
      (config.storageMethod != 'file')
    ) {
      log.error(new Error('invalid storage method: ' + config.storageMethod));
    }
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
  var meta;
  if (config.noMeta) {
    callback();
    return;
  }
  if (directory.hasError('deleted')) {
    log.debug(directory.logName, '| can not store meta in deleted directory');
    callback();
    return;
  }
  meta = JSON.stringify(directory.meta, null, ' ');
  if (config.storageMethod == 'db') {
    new db.Releases({
      path: directory.absolute,
      meta: meta
    }).save()
    .then(callback)
    .catch(function(err) {
      log.error(new Error(err));

    });
  } else if (config.storageMethod == 'file') {
    fs.writeFile(
      path.join(directory.path, '.meta'),
      meta,
      function(err) {
        log.debug(directory.logName, '| stored meta');
        if (err) {
          log.debug(err);
        }
        callback();
      }
    );
  }

};

/**
 * ## retrieve
 * retrieve meta from `.meta` file
 *
 * @param {Directory} directory
 * @param {function} callback
 */
retrieve = function(directory, callback) {
  if (config.storageMethod == 'db') {
    new db.Releases({
      path: directory.absolute
    })
    .fetch({
      require: true
    })
    .then(function(model) {
      parse(directory, model.get('meta'), callback);
    })
    .catch(function(err) {
      log.debug(directory.logName, '| no meta present');
      callback();
      return;
    });
  } else if (config.storageMethod == 'file') {
    fs.readFile(
      path.join(directory.path, '.meta'),
      function(err, data) {
        if (err) {
          log.debug(directory.logName, '| no meta present');
          callback();
          return;
        }
        parse(directory, data, callback);
      }
    );
  }
};
parse = function(directory, data, callback) {
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
};

/**
 * ## module.exports
 */
module.exports = {
  store: store,
  retrieve: retrieve
};
