/**
 * ## onNoMedia Plugin
 */

/**
 * ## require
 */
var _                   = require('../underscore');
var fs                  = require('../fs');
var log                 = require('../log');
var getConductor        = require('../getConductor');
var config              = require('../config');
var Contravention       = require('../Contravention');


/**
 * ## export structure
 *
 * export this specific structure
 *
 */
module.exports = {
  options: {
    errNoMedia: [
      false,
      'action if dir contains no media (leave|delete)',
      'string',
      'leave'
    ]
  },
  primary: function(directory, callback) {
    if (!directory.hasError('noMedia')) {
      callback();
      return;
    }
    switch (config.errNoMedia) {
      case 'delete': {
        log.info(directory.logName, '| no media - delete');
        new Contravention(directory, 'deleted');
        fs.rmdir(directory.path, callback);
        return;
        break;
      }
      case 'leave': {
        log.info(directory.logName, '| no media - leave');
        break;
      }
    }
    callback();
  }
};
