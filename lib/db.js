var knex = require('knex');
var config = require('./config');
var bookshelf = require('bookshelf');
var fs                  = require('fs');

var db = {};
var initDb;

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
  validation: function(config) {},
  init: function(config) {
    initDb();
  }
});

initDb = function() {
  console.log(config.sqliteDb);
  knex = knex({
    client: 'sqlite3',
    connection: {
      filename: config.sqliteDb
    }
  });
  bookshelf = bookshelf(knex);
  db.Releases = bookshelf.Model.extend({
    tableName: 'releases'
  });

  bookshelf.knex.schema.createTableIfNotExists('releases', function(table) {
    console.log('creating table');
    table.increments();
    table.string('path');
    table.text('meta');
    table.timestamps();
  });

};

module.exports = db;


