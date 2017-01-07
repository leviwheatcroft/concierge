/**
 * ## actions
 * acts as a controller, groups functions into actions
 */
/**
 * ## require & declarations
 */
// require some things
var async               = require('async');
var Promise             = require('bluebird');
var bootstrap           = require('./bootstrap');
var db                  = require('./db');
var _                   = require('./underscore');
var plugins             = require('./plugins');
var bootstrap           = require('./bootstrap');
var meta                = require('./meta');
var metaMedia           = require('./metaMedia');
var metaTmdb            = require('./metaTmdb');
var move                = require('./move');
var detectTypes         = require('./detectTypes');
var config              = require('./config');
var wrap                = require('./wrap');



var actions;
var report;
var list;
var add;


/**
 * ## config
 *  deal with configuration options specific to this module
 *
 * * action
 */
config.push({
  options: {
    action: [
      'a',
      'specify action (process|meta|report)',
      'string',
      'process'
    ]
  },
  validation: function(config) {
    if (!_.contains(actions, config.action)) {
      throw new Error('invalid action: ' + config.action);
    }
  },
  init: function(config) {
  }
});

/**
 *  ## actions
 * `wrapConcurrent` doesn't mean run the functions specified concurrently, it
 * means process directories concurrently, through the specified series.
 */
actions = [
  'meta',
  'process',
  'report',
  'list',
  'add'
];

var foo = {
  meta: [
    meta.retrieve,
    metaMedia,
    metaTmdb,
    meta.store
  ],
  process: [
    meta.retrieve,
    metaMedia,
    metaTmdb,
    detectTypes,
    plugins.primary,
    move,
    meta.store
  ],
  report: [
    db.report
  ]
};
report = function() {
  var directories = [];
  bootstrap(directories)
  .then(function() {
    var fns;
    fns = wrap.concurrent([
      meta.retrieve,
      metaMedia,
      metaTmdb,
      db.createUpdate
    ]);
    fns(directories);
  });
  process.exit();
};
list = function() {
  db.list()
};
add = function() {
  var directories = [];
  bootstrap(directories)
  .then(function() {
    var fns;
    fns = wrap.concurrent([
      meta.retrieve,
      metaMedia,
      metaTmdb,
      db.createUpdate
//      db.exit
    ]);
    fns(directories);
  });

};

/**
 * ## module.exports
 * thin wrapper to launch specified action
 */
module.exports = {
  add: add,
  report: report,
  list: list
}
