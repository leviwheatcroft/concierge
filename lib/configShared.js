module.exports = [
  /**
   * ### ignoreCache
   */
  {
    options: {
      ignoreCache: [
        false,
        'ignore cached meta from media and tmdb',
        'true',
        true
      ],
/**
 * ## config
 * define options specific to this module
 *
 * * parent - if specified, all direct children will be processed
 * * target - if specified, only that directory will be processed, parent will
 *    be ignored.
 */
      parent: [
        'p',
        'parent directory (will process children)',
        'string'
      ],
      target: [
        't',
        'target directory (overrides parent)',
        'string'
      ],
      action: [
        'a',
        'action (process|db)',
        'string',
        'process'
      ]
    },
    validation: function(config) {
      // there's basically two modes of operation, parent or target, you need
      // at least one of them specified
      if (!config.parent && !config.target) {
        log.throwError('specify at least one of --parent or --target');
      }

      // it's sensible to convert paths to absolute, just in case we need to
      // compare them to some path in the db
      config.target = config.target ? path.resolve(config.target) : false;
      config.parent = config.parent ? path.resolve(config.parent) : false;
    },
    init: function(config) {}
  },
];


