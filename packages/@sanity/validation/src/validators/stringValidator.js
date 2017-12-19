const ValidationError = require('../ValidationError')

const min = (minLength, value, message) => {
  if (value.length < minLength) {
    throw new ValidationError(message || `String must be at least ${minLength} characters long`)
  }
}

module.exports = {
  min
}
