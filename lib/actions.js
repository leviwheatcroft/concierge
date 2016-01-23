/**
 * ## actions
 * acts as a controller, groups functions into actions
 */
/**
 * ## require & declarations
 */
// require some things
var async               = require('async');
var _                   = require('./underscore');
var plugins             = require('./plugins');
var bootstrap           = require('./bootstrap');
var meta                = require('./meta');
var metaMedia           = require('./metaMedia');
var metaTmdb            = require('./metaTmdb');
var move                = require('./move');
var detectTypes         = require('./detectTypes');
var config              = require('./config');
var getConductor        = require('./getConductor');

var actions;
var runAction;
var actionConductors = {};


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
      'specify action (process|media|tmdb|update)',
      'string',
      'process'
    ]
  },
  validation: function(config) {
    if (!_.contains(_.keys(actions), config.action)) {
      throw new Error('invalid action: ' + config.action);
    }
  },
  init: function(config) {
    _.each(actions, function(fns, action) {
      actionConductors[action] = getConductor(actions[config.action], true);
    });
  }
});

// ## actions
// an object listing the functions included in the different available actions
actions = {
  media: [
    meta.retrieve,
    metaMedia,
    meta.store
  ],
  tmdb: [
    meta.retrieve,
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
  ]

};

/**
 * ## module.exports
 * thin wrapper to launch specified action
 */
module.exports = function() {
  actionConductors[config.action].apply(this, arguments);
};
