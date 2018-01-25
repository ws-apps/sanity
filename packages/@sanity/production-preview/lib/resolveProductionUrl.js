'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _resolveProductionUrl = require('part:@sanity/production-preview/resolve-production-url');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_resolveProductionUrl).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }