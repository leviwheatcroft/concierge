/**
 * ## report module
 */

/**
 * ## requires and declarations
 */


report = function(directory, callback) {
  new Releases({ path: config.target })
  .fetch()
  .then(function(result) {
    log.info(result);
  })
  .catch(function(err) {
    new Fatal(err);
  });

};
