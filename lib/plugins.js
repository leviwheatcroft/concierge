// required things

var async               = require('async');
var Promise             = require('bluebird');
var requireDir          = require('require-dir');
var _                   = require('./underscore');
var config              = require('./config');
var log                 = require('./log');

// declarations
var events = {};
var stage;
var stages

/**
 * ## stages
 * a list of the valid plugin types or stages
 */
stages = [
  'primary'
];

/**
 * ## init
 * loads plugins, stores them for later retrieval with `stage` method, inits
 * config with configs loaded from plugins
 *
 * `config.push` is used to collate the settings defined within plugins and
 * modules.
 *
 * this fn is called before `config.init`, so log fns won't work..
 */
init = function() {
  var plugins;

  plugins = requireDir('./plugins');
  if (!_.isArray(plugins)) {
    plugins = [ plugins ];
  }
  return Promise.each(plugins, function(plugin, key) {
    config.push(_.pick(plugin, config.push.keys));
    _.collate(events, _.omit(plugin, config.push.keys));
  });
};

// ## stage
// wraps all plugins for given stage, see `stages` for valid stages
//
// @param {string} stage
// @return {function}
primary = function() {
  wrap.series(events.primary).apply(this, arguments);
};

// export
module.exports = {
  init: init,
  primary: primary
};
