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

module.exports = {
  type
}
