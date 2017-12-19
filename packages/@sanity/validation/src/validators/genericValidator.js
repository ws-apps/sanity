const Type = require('type-of-is')
const ValidationError = require('../ValidationError')

const type = (expected, value, message) => {
  if (!Type.is(value, expected)) {
    return new ValidationError(
      message || `Expected type "${expected}", got "${Type.string(value)}"`
    )
  }

  return true
}

const presence = (expected, value, message) => {
  if (typeof value === 'undefined' && expected === 'required') {
    return new ValidationError(message || 'Value is required')
  }

  return true
}

module.exports = {
  type,
  presence
}
