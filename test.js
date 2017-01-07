var Promise = require('bluebird');

var test1 = function() {
  console.log('do something');
  return new Promise(function(resolve) {
    setTimeout(function() {
      console.log('do something async');
      resolve();
    }, 2000);
  }).then(function() {
    console.log('then1');
  }).then(function() {
    console.log('then2');
  });
};
var test2 = Promise.resolve();

Promise.each([test1, test2], function(fn) {
  return fn();

  Promise.each(test, function(value) {
    console.log(value);
  }),
  new Promise(function(resolve) {
    setTimeout(function() {
      console.log('timer');
      resolve();
    }, 1000);
  }).then(function() {
    console.log('then1');
  }).then(function() {
    console.log('then2');
  }),

  Promise.each(test, function(value) {
    console.log(value);
  }),
  function(testOut) {
    console.log(prom.isFulfilled());
    console.log(testOut);
    console.log('finish');
  }
);


