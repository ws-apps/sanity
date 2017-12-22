const ValidationError = require('../ValidationError')
const genericValidator = require('./genericValidator')

const min = (minLength, value, message) => {
  if (value.length >= minLength) {
    return true
  }

  return new ValidationError(message || `String must be at least ${minLength} characters long`)
}

const max = (maxLength, value, message) => {
  if (value.length <= maxLength) {
    return true
  }

  return new ValidationError(message || `String must be at most ${maxLength} characters long`)
}

module.exports = Object.assign({}, genericValidator, {
  min,
  max
})
