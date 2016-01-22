/**
 * ## metaTmdb module
 * query themoviedb.org for release meta
 */

/**
 * ## require & define
 */
var _                   = require('underscore');
var path                = require('path');
var async               = require('async');
var tmdb                = require('moviedb');
var Levenshtein         = require('levenshtein');
var S                   = require('string');
var config              = require('./config');
var fs                  = require('./fs');
var log                 = require('./log');
var getConductor        = require('./getConductor');
var Contravention       = require('./Contravention');


var checkNfo;
var checkPath;
var getName;
var getYear;
var queryTmdb;
var validate;

/**
 * ## config
 * define options specific to this module
 *
 * * tolerateDistance - there's a Levenshtein algorithm which calculates the
 *   'distance' between two strings which I think is the number of edits
 *   required to change one string to the other.. so I think it's the number
 *   of characters added or removed specify an integer.
 * * ignoreCache - defined in `./config`
 */
config.push({
  options: {
    apiKey: [
      'a',
      'tmdb api key',
      'string'
    ],
    tolerateDistance: [
      false,
      'number of changed characters between folder name and movie title',
      'int',
      10
    ]
  },
  validation: function(config) {
    if (!config.apiKey) {
      throw new Error('tmdb api key required');
    } else {
      tmdb = tmdb(config.apiKey);
    }
    if (config.tolerateDistance > 30) {
      throw new Error('tolerate distance must be less than 30');
    }
  }
});


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
    (directory.meta.tmdbCache)
  ) {
    log.debug(directory.logName, '| using tmdb cache, no refresh');
    callback(true); // Break series in conductor
    return;
  }
  callback();
};

checkNfo = function(directory, callback) {
  var nfoFile;
  var imdbId;
  nfoFile = _.find(directory.children, function(file) {
    return file.extname == 'nfo';
  });
  if (!nfoFile) {
    callback();
    return;
  }
  nfoFile = fs.readFileSync(nfoFile.path);
  imdbId = /tt[0-9]{7}/.exec(nfoFile);
  if (!imdbId) {
    callback();
    return;
  }
  directory.meta.imdbId = imdbId[0];
  callback();
};
checkPath = function(directory, callback) {
  directory.meta.name = getName(directory.basename);
  directory.meta.year = getYear(directory.basename);
  callback();
};
getName = function(source) {
  var name = source;
  var bracket;
  var year;


  truncateTo = [
    /([1-2][9|0|1][0-9]{2})/,
    /\(/,
    /720p/,
    /1080p/
  ];

  _.each(truncateTo, function(regex) {
    var match;
    match = regex.exec(name);
    if (!match) {
      return;
    }
    name = name.slice(0, match.index);
  });

  // Dots as spaces
  name = name.replace(/\./g, ' ');

  // Underscores as spaces
  name = name.replace(/\_/g, ' ');

  // Trailing spaces
  name = name.trim();

  return name;
};

getYear = function(source) {
  var year;
  year = /(19[0-9]{2}|20[01][1-9])/.exec(source);
  if (!year) {
    return false;
  }
  return year[0];
};

queryTmdb = function(directory, callback) {
  var request = {};
  var endpoint;

  if (directory.meta.imdbId) {
    log.debug(directory.logName, '| got imdb id from nfo');
    request.id = directory.meta.imdbId;
    request.external_source = 'imdb_id';
    endpoint = 'find';
  } else {
    request.query = directory.meta.name;
    if (directory.meta.year) {
      log.debug(directory.logName, '| got name and year from path');
      request.year = directory.meta.year;
    } else {
      log.debug(directory.logName, '| got name from path (no year)');
    }
    endpoint = 'searchMovie';
  }

  tmdb[endpoint](request, function(err, result) {
    var plainName;
    if (err) {
      log.info(directory.logName, '| tmdb error');
      log.info(directory.logName, '| ', directory.meta.name);
      log.info(err);
      log.info(result);
      throw err;
    }
    log.silly('will dump tmdb response for ', directory.logName);
    log.silly(JSON.stringify(result, null, '  '));

    result = result.movie_results || result.results || false;

    if (!result || _.isEmpty(result)) {
      log.info(directory.logName, '| no match found');
      new Contravention(directory, 'noMatch');
      callback(false);
      return;
    }
    if (directory.meta.imdbId) {
      directory.meta.likelyError = 0;

    } else {
      log.silly(result[0].title);
      directory.meta.likelyError = new Levenshtein(
        result[0].title.replace(/[^a-z0-9]/gi,'').toLowerCase(),
        directory.meta.name.replace(/[^a-z0-9]/gi,'').toLowerCase()
      ).distance;
    }

    _.extend(
      directory.meta,
      {
        tmdbCache: true
      },
      result[0]
    );
    if (!/^[0-9]{4}/.exec(directory.meta.release_date)) {
      log.info(directory.path);
      log.info(directory.meta.release_date);
      log.info(JSON.stringify(directory.meta, null, '  '));
      // log.info(result);
    }
    directory.meta.year = /^[0-9]{4}/.exec(directory.meta.release_date)[0];
    directory.meta.alternatives = {}
    _.each(result.slice(1), function(alternative, idx) {
      directory.meta.alternatives[idx] = [
        alternative.id,
        ': ',
        alternative.title
      ].join('');
    });
    if (directory.meta.likelyError > config.tolerateDistance) {
      directory.meta.contra = 'tmdb has unsuitable matches';
    }
    log.info(
      directory.logName,
      '| matched [likely error: ',
      S(directory.meta.likelyError).padLeft(3).s,
      '] [alternatives: ',
      S(result.length - 1).padLeft(3).s,
      ']'

    );
    callback();
  });
};

module.exports = getConductor([
  validate,
  checkNfo,
  checkPath,
  queryTmdb
]);
