var config              = require('./config');
var bookshelf           = require('bookshelf');
var fs                  = require('fs');
var Fatal               = require('./Fatal');
var log                 = require('./log');
var path                = require('path');
var Promise             = require('bluebird');
var tmdb                = require('moviedb');

var initDb;
var Releases;
var asFields;
var createUpdate;
var releases;
var knex;

module.exports = {};

/**
 * ## config
 *  deal with configuration options specific to this module
 *
 * * output directory
 * * otherExtensions
 */
config.push({
  options: {
    sqliteDb: [
      's',
      'sqlite database file',
      'string',
      '../concierge.sqlite'
    ]
  },
  validation: function(config) {

    if (
      (config.action == 'query') &&
      (!config.key || !config.value)
    ) {
      new Fatal('query requires key and value options');
    }
    if (!config.apiKey) {
      throw new Error('tmdb api key required');
    } else {
      //tmdb = tmdb(config.apiKey);
    }
  },
  /**
   * ## init
   *
   * for this module it seems more readable to refer to a discrete initDb fn
   */
  init: function() {
    return initDb();
  }
});


initDb = function() {
  // initialize knex
  knex = require('knex')({
    dialect: 'sqlite3',
    connection: {
      filename: config.sqliteDb
    }
  });
  // initialize bookshelf
  bookshelf = bookshelf(knex);
  return Promise.join(
    createReleases(),
    createGenres(),
    function(Releases, Genres) {
      console.log('join cb');
      _.extend(module.exports, {
        Releases: Releases,
        Genres: Genres
      });
    }
  );
};
releases = {
  path:       'string',
  absolute:   'string',
  basename:   'string',
  dirname:    'string',
  extname:    'string',
  logName:    'string',
  meta:       'text'
};
createReleases = function() {
  return knex.schema.createTableIfNotExists('releases', function(table) {
    table.increments();
    table.timestamps();
    table.string('path');
    table.string('absolute');
    table.string('basename');
    table.string('dirname');
    table.string('extname');
    table.string('logName');
    table.text('meta');
  }).then(function() {
    // inject model into promise chain as return value
    return bookshelf.Model.extend({
      tableName: 'releases'
    });
  })
  .catch(function(e) {
    log.error(e);
  });

};
createGenres = function() {
  console.log('createGenres');
  return knex.schema.createTableIfNotExists('genres', function(table) {
    table.increments();
    table.timestamps();
  })
  .then(function() {
    var Genres;
    Genres = bookshelf.Model.extend({
      tableName: 'genres'
    });
    return Genres.count()
    .then(function(count) {
      if (count > 0) {
        return Promise.resolve();
      }
      log.info('populating Genres from tmdb');
      tmdb = tmdb(config.apiKey);
      console.log(_.isFunction(tmdb.genreList));
      console.log(_.keys(tmdb));
      tmdb.genreList(function(genres) {
        console.log(genres);
        throw 'die';
      });
      /*
      return Promise.promisify(tmdb.genreList)({})
      .then(function(genres) {
        console.log(genres);
        throw 'die';
      });
      */
    });
  })
  .then(function() {
    // inject model into promise chain as return value
    return bookshelf.Model.extend({
      tableName: 'genres'
    });
  })
  .catch(function(e) {
    log.error(e);
  });
};

list = function() {
  var query;
  if (config.target) {
    query = Releases.where('path', path.resolve(config.target));
  } else {
    query = Releases.where('dirname', path.resolve(config.parent));
  }
  query
  .fetchAll({
    require: true
  })
  .then(function(releases) {
    releases.each(function(release) {
      log.info(release.get('logName'));
    });
  })
  .catch(function(e) {
    console.log(e);
  });
};
createUpdate = function(directory, callback) {
  directory = asFields(directory);

  Releases.where('path', directory.absolute)
  .fetch({
    require: true
  })
  .then(function(release) {
    if (release.meta == meta) {
      log.info(directory.logName, '| no update required');
      callback();
      return;
    }
    release.meta = directory.meta;
    release.save()
    .then(function() {
      log.info(directory.logName, '| updated');
      callback();
    });
  })
  .catch(function() {
    new Releases(directory)
    .save()
    .then(function() {
      log.info(directory.logName, '| created new record');
      callback();
    });
  });
};
asFields = function(directory) {
  directory = _.pick(directory, _.keys(releases));
  directory.meta = JSON.stringify(directory.meta, null, ' ');
  return directory;
};

module.exports = {
  createUpdate: createUpdate,
  list: list
};

