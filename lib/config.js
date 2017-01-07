/**
 * ## config module
 * manages configuration and the `config` object used by most modules.
 *
 * there are multiple ways to configure, from lowest to highest priority..
 *
 * * defaults - written in code
 * * ini file - defined in `config.ini` or user specified ini
 * * passed in from command line
 *
 * just to complicate things, the plugin structure needs to allow configuration
 * to occur within the plugin file.. so configuration needs to be able to happen
 * in a decentralised way.
 *
 * `lib/log.js` is a fairly good example of how to use configuration
 */

/**
 * require the good stuff
 */
var _                   = require('./underscore.js');
var Promise             = require('bluebird');
var ini                 = require('ini');
var path                = require('path');
var cli                 = require('cli');
// This is the real, unwrapped one, avoids circular require
var fs                  = require('fs');


/**
 * declaration
 */
var config;
var getCommandLine;
var getIni;
var filterOptions;

var options = {};
var validationFns = [];
var initFns = [];

/**
 * ## filterOptions
 *
 * this is a convenience function to deal with the fact that readIni and
 * commander both return an object with various methods and properties which
 * are not actually part of this app's configuration. so when you run readIni
 * and commander, you can run the result through this function to strip out
 * *most* of the nonsense.
 *
 * @param {object} list settings object
 */
filterOptions = function(list) {
  return _.omit(list, function(value, key) {
    return (
      (_.isFunction(value)) ||
      (!_.has(list, key))
    );
  });
};

/**
 * ## getCommandLine
 *
 * use a [cli](https://www.npmjs.com/package/cli) instance to
 * handle fancy cli stuff. Also attach options defined in other modules using
 * `config.push`
 */
getCommandLine = function() {
  cli.enable('version', 'help');

  cli.parse(options);


  return cli.options;
};

  /*
  command.option(
    '--err-no-match [action]',
    'action where movie cannot be identified',
    /^(leave|delete)$/i
  );
  command.option(
    '--err-vol-num [action]',
    'action where multiple volumes are not numbered',
    /^(leave|delete)$/i
  );
  command.option(
    '--err-target-exists [action]',
    'action where target directory / movie already exists',
    /^(leave|delete)$/i
  );
  */

/**
 * ## getIni
 *
 * load config from ini file
 *
 * @param {string} [configFile=config.ini] path to ini file
 */
getIni = function(configFile) {
  var iniFile;
  // Find config file
  if (configFile) {
    if (!fs.existsSync(configFile)) {
      throw 'cant find config: ' + configFile;
    }
  }
  iniFile = fs.readFileSync(configFile, 'utf-8');
  iniFile = ini.parse(iniFile);
  iniFile = filterOptions(iniFile);
  return iniFile;
}



/**
 * ## init
 *
 * defaults doesn't work how it might appear, it's not really defaults or extend
 * or whatever.
 *
 * `cli` module doesn't really allow you to have a config file. you want
 * precedence to run like:
 *
 * command line > ini file > defaults
 *
 * the only way I could find to do this was to collect options in `options` var,
 * then strip the defaults defined therein. Then if you run `cli.parse`,
 * options with no default will be unset. then you can just `_.extend`
 * everything into a single `config` object.
 *
 * @param {Object} modOptions
 * @param {Boolean} modOptions.fromIni load config from ini
 * @param {Boolean} modOptions.fromCli load config from cli
 *
 */
init = function(modOptions) {
  var cliOptions = {};
  var iniOptions = {};
  var defaults = {};

  // populate options
  push({
    options: {
      configFile: [
        'c',
        'specify config file',
        'file',
        path.join(path.resolve(__dirname, '..'), 'config.ini')
      ]
    }
  });

  push(require('./configShared'));

  // remove the defaults from options to be passed to cli
  _.each(options, function(value, key) {
    if (value.length == 4) {
      defaults[key] = value.pop();
    }
  });

  if (modOptions.fromCli) {
    // get options from cli, purge null values
    cliOptions = _.compactObject(getCommandLine());
  };

  if (modOptions.fromIni) {
    // get options from ini
    iniOptions = getIni(cliOptions.configFile || defaults.configFile);
  }

  // amalgamate, right most has precedence
  _.extend(config, defaults, iniOptions, cliOptions, modOptions);

  // this allows validation or init Fns to optionally return promises. Execution
  // will be delayed until all are resolved (I'm looking at you knex)
  return Promise.all([
    Promise.each(validationFns, function(fn) {
      return fn(config);
    }),
    Promise.each(initFns, function(fn) {
      return fn(config);
    })
  ]);
};


/**
 * ## push
 *
 * see lib/fsItems.js for example usage.
 *
 * @param {Object} definition
 * @param {Object} definition.options cli style arrays
 * @param {Function} [definition.validation] validation function
 * @param {Function} [definition.init] initialisation function
 *
 * ### initialisation functions
 * will be passed completed config object
 *
 * ```
 * function(config) {
 *   // initialise module
 * }
 * ```
 */
push = function(definition) {
  _.extend(options, definition.options);

  if (definition.validation) {
    validationFns.push(definition.validation);
  }
  if (definition.init) {
    initFns.push(definition.init);
  }
};

/**
 * ## push.keys
 * here for reference, convenience
 */
push.keys = [ 'options', 'validation', 'init' ];

/**
 * ## config
 *
 * initialize the object here.. this ensures the `init` and `push` methods
 * are always present even after calling `init` to populate it.
 */
config = {
  init: init,
  push: push,
  options: options
};

module.exports = config;

