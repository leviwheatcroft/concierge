var _ = require('underscore');
var config = require('./config');
var fs = require('./fs.js');
var path = require('path');
var async = require('async');
var avprobe = require('avprobemeta');
var getConductor = require('./getConductor');
var Contravention = require('./Contravention');
var log = require('./log.js');

var getMetaFromMedia;
var validate;
var isMedia;


/**
 * ## config
 * module uses ignoreCache which is defined in `./config.js` because it's
 * used in other modules also.
 * no config required for this module
 */

/**
 * ## validate
 * check whether or not we can retrieve meta for this directory
 *
 */
validate = function(directory, callback) {
  if (directory.hasError()) {
    callback(directory.meta.contravention);
    return;
  }
  if (
    (!config.ignoreCache) &&
    (directory.meta.mediaCache)
  ) {
    log.debug(directory.logName, '| using media cache, no refresh');
    callback(true); // Break series in conductor
    return;
  }
  callback();
};

/* ========================================================= getMetaFromMedia ==
 *
 * avprobe largest media file
 */
getMetaFromMedia = function(directory, callback) {
  var selection;

  selection = _.filter(directory.children, function(file) {
    return _.contains(
      [ 'mkv', 'avi', 'mp4' ],
      file.extname
    );
  });
  largest = _.max(selection, function(file) {
    return file.stat.size;
  });
  avprobe(
    largest.path,
    function(err, data) {
      var selected = {
        mediaCache: true,
        audioCodec: '',
        formatName: data.format.format_name,
        formatLongName: data.format.format_long_name,
        duration: Math.floor(data.format.duration / 60),
        bitRate: data.format.bit_rate
      };

      _.each(data.format.streams, function(stream) {
        if (stream.codec_type == 'video') {
          _.extend(
            selected,
            {
              videoCodec: stream.codec_name,
              videoLongCodec: stream.codec_long_name,
              videoWidth: stream.width,
              videoHeight: stream.height
            }
          );
        } else if (stream.codec_type == 'audio') {
          selected.audioCodec = [
            selected.audioCodec,
            '|',
            stream.codec_name
          ].join('');
        }
      });
      _.extend(directory.meta, selected);
      log.info(directory.logName, '| got media meta from avprobe');
      log.silly(JSON.stringify(selected, null, '  '));
      callback();
    }
  );
};

module.exports = getConductor([
  validate,
  getMetaFromMedia
]);


