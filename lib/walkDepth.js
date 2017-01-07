var fs = require('./fs.js');
var path = require('path');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var util = require('util');

var AsyncEmitter;
var Walker;

AsyncEmitter = function() {
  EventEmitter.apply(this, arguments);
}
util.inherits(AsyncEmitter, EventEmitter);
AsyncEmitter.prototype.emit = function(event) {
  var args;
  var callback;
  args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  args.shift();
  async.eachSeries(this.listeners(event), function(listener, next) {
    listener.apply(this, args.concat(next));
  },
  callback
  );
};


Walker = function(parent, options, callback) {
  var walker = this;
  this.root = root;
  this.result = [];
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  if (!callback) {
    callback = options.callback;
  }
  if (!options.emitter) {
    options.emitter = new AsyncEmitter();
    if (_.isObject(options.on)) {
      _.each(options.on, function(listener, event) {
        options.emitter.on(event, listener);
      });
    }
  }
  this.options = options;
  this.emitter = options.emitter;

  process.nextTick(function() {
    fs.readdir(parent, function(err, files) {
      async.each(
        files,
        function(child, next) {
          var stat;
          stat = fs.statSync(path.join(parent, child));
          if (stat.isFile()) {
            walker.emitter.emit(
              'file',
              parent,
              child,
              stat,
              next
            );
          } else if (stat.isDirectory()) {
            walker.emitter.emit(
              'directory',
              parent,
              child,
              stat,
              function(err) {
                if (
                  (options.maxDepth != -1) &&
                  (options.maxDepth > options.depth)
                ) {
                  new Walker(
                    path.join(root, item),
                    _.extend({}, options, { depth: options.depth + 1 }),
                    next
                  );
                } else {
                  next();
                }
              }
            );
          } else {
            msg = 'not file or directory';
            log.error(msg);
            throw(msg);
          }
        },
        function(err) {
          callback(null, walker.result);
        }
      );
    });
  });
};

Walker.prototype.on = function() {
  this.options.emitter.on.apply(this.options.emitter, arguments);
}

module.exports = Walker;
