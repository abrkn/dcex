const { promisify } = require('util');
const { safeFunction } = require('safep');

exports.applyTo = function(target, ...methods) {
  for (const name of methods) {
    target[`${name}Async`] = promisify(target[name].bind(target));
    target[`${name}Safe`] = safeFunction(target[`${name}Async`]);
  }
};
