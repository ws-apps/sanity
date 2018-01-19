const ValidationError = require('../ValidationError')
const genericValidator = require('./genericValidator')

const presence = (expected, value, message) => {
  if (expected !== 'required') {
    return true
  }

  if (typeof value === 'undefined' || Object.keys(value).length === 0) {
    return new ValidationError(message || 'Value is required')
  }

  return true
}

module.exports = Object.assign({}, genericValidator, {
  presence
})
