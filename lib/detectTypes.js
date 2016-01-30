/**
 * ## detectTypes module
 * this is designed to run through a directory's children and determine what
 * each file is for.
 */

/**
 * ## require
 */
var _                   = require('underscore');
var path                = require('path');
var async               = require('async');
var jsdiff              = require('diff');
var config              = require('./config');
var log                 = require('./log');
var getConductor        = require('./getConductor');
var fs                  = require('./fs');
var Contravention       = require('./Contravention');

/**
 * ## declarations
 */
var attachSubtitles;
var identifyMediaTypes;
var identifyFeature;
var assignSuffixes;
var typeSuffixes;
var validate;

/**
 * ## typeSuffixes
 * these are the strings which are placed in filenames for different types
 */
typeSuffixes = {
  trailer: ' Trailer',
  1: ' - Disk 1',
  2: ' - Disk 2',
  3: ' - Disk 3'
};



/**
 * ## config
 * no config required for this module
 */

/**
 * ## validate
 * check whether or not we can retrieve meta for this directory
 *
 */
validate = function(directory, callback) {
  if (directory.hasError()) {
    log.debug(
      directory.logName,
      '| detectTypes skip: ',
      directory.meta.contravention.toString()
    );
    callback(directory.meta.contravention);
    return;
  }
  callback();
};
/**
 * ## attachSubtitles
 *
 * find any subtitle files with the same name as media, so they can be renamed
 * together
 *
 * @param {Directory} directory
 * @param {function} callback
 */
attachSubtitles = function(directory, callback) {
  var mediaFiles;
  mediaFiles = _.where(directory.children, {type: 'media'});
  _.each(mediaFiles, function(mediaFile) {
    var subFile;
    subFile = _.where(directory.children, {
      type: 'subtitle',
      basename: mediaFile.basename
    });
    if (_.isEmpty(subFile)) {
      log.silly(mediaFile.logName, '| no subs detected');
    } else {
      log.silly(mediaFile.logName, '| got subtitles');
      mediaFile.subFile = subFile[0];
    }
  });
  callback();
};

/**
 * ##identifyMediaTypes
 *
 * this is where we identify trailers
 * basically find largest file size, any media files which are less than half
 * that must be either a trailer or sample. Everything else will be a feature.
 *
 * @param {Directory} directory
 * @param {function} callback
 */
identifyMediaTypes = function(directory, callback) {
  var largestMedia;
  var selection;

  // Identify types of media file.

  selection = _.where(directory.children, {type: 'media'});

  largestMedia = _.max(selection, function(file) {
    return file.stat.size;
  }).stat.size;
  _.each(selection, function(file) {
    if (
      (file.stat.size < (largestMedia * 0.5)) &&
      (/trailer/i.test(file.basename))
    ) {
      // Small & contains "trailer" - is trailer
      file.type = 'trailer';
    } else if (file.stat.size < (largestMedia * 0.5)) {
      // Small, not trailer - is sample or something
      file.type = 'junk';
    } else {
      // Large - probably movie
      file.type = 'feature';
    }
    log.silly(file.logName, '| media type: ', file.type);
  });
  callback();
};



/**
 * ## identifyFeature
 *
 * this is where we identify multi disk releases, et cetera
 * basically diff the filenames and look for numbers in the diffs
 *
 * @param {Directory} directory
 * @param {function} callback
 */
identifyFeature = function(directory, callback) {
  var volumes;
  var volumeOne;
  volumes = _.where(directory.children, {type: 'feature'});
  // If there's only one feature then there's nothing more to see here.
  if (volumes.length < 2) {
    callback();
    return;
  }
  log.debug(directory.logName, '| found ', volumes.length, ' feature file(s)');

  // Grab the first feature file - we're going to compare it to the others
  volumeOne = volumes.shift();
  _.each(volumes, function(volume) {
    var diffs;
    var added;
    var removed;
    diffs = jsdiff.diffChars(volumeOne.basename, volume.basename);

    // The part of filename which doesn't match volumeOne
    added = _.findWhere(diffs, { added: true });
    added = /[0-9]*/.exec(added.value);
    if (
      added &&
      parseInt(added[0]) <= 3
    ) {
      volume.type = added[0];
      log.debug(volume.logName, '| found vol: ', volume.type);
    }

    // The part of volumeOne which doesn't match this filename
    removed = _.findWhere(diffs,{ removed: true});
    removed = /[0-9]*/.exec(removed.value);
    if (
      volumeOne.type == 'feature' &&
      removed &&
      parseInt(removed[0])
    ) {
      volumeOne.type = removed[0];
      log.debug(volumeOne.logName, '| found vol: ', volumeOne.type);
    }
  });
  // At this point if theres anything which still has type 'feature' then we
  // couldn't find a volume number for it. We need human intervention.
  if (_.findWhere(directory.children, {type: 'feature'})) {
    callback(new Contravention(directory, 'volNum'));
    return;
  }
  callback();
};

/**
 * ## assignSuffix
 *
 * assign suffix for filenames
 *
 * @param {Directory} directory
 * @param {function} callback
 */
assignSuffixes = function(directory, callback) {
  _.each(directory.children, function(file) {
    if (typeSuffixes[file.type]) {
      file.suffix = typeSuffixes[file.type];
      if (file.subFile) {
        file.subFile.suffix = typeSuffixes[file.type];
      }
    }
  });
  callback();
};

module.exports = getConductor([
  validate,
  attachSubtitles,
  identifyMediaTypes,
  identifyFeature,
  assignSuffixes
]);
