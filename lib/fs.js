var fs = require('fs');
var log = require('./log.js');
var config = require('./config.js');
var _ = require('underscore');
var mv = require('mv');
var rmdir = require('rmdir');
var mkdirp = require('mkdirp');

var fnsWrap;
var fnsPass;

/**
 * ## config
 * define options specific to this module
 *
 * * dry - don't write any changes to hard drive
 * * dryQuite - as above, no warnings.
 */
config.push({
  options: {
    dry: [
      'd',
      'test run, no changes to fs',
      'true'
    ],
    dryQuiet: [
      'q',
      'test run, no warnings',
      'true'
    ]
  },
  init: function(config) {
    config.dry = config.dryQuiet || config.dry || false;
  }
});



/* ============================= fnsWrap ==
 * these fns picked from nodes fs module will be wrapped with the 'test' switch
 */
fnsWrap = {
  renameSync: fs.renameSync,
  mv: mv,
  writeFile: fs.writeFile,
  rmdir: rmdir,
  mkdirpSync: mkdirp.sync,
  mkdirp: mkdirp

};
/* ================= fnsPass ==
 * these fns just pass straight through
 */
fnsPass = {
  statSync: fs.statSync,
  stat: fs.stat,
  readFile: fs.readFile,
  readFileSync: fs.readFileSync,
  exists: fs.exists,
  existsSync: fs.existsSync,
  readdir: fs.readdir,
  readdirSync: fs.readdirSync
};

/* =============== module.exports ==
 * wrap functions with a 'test' switch
 *
 * this is the easiest way I could thinkof to avoid mistakes
 */
module.exports = (function() {
  var fns = {};
  _.each(fnsWrap, function(fn, key, list) {

    fns[key] = function() {
      var lastArg = Array.prototype.slice.call(arguments).pop();
      if (!config.dry) {
        fn.apply(this, arguments);
        return; // Callback in arguments
      }
      if (!config.dryQuiet) {
        log.info(key + ' call disabled by test');
      }
      if (_.isFunction(lastArg)) {
        lastArg();
      }
    };
  });
  _.extend(fns, fnsPass);
  return fns;
})();




