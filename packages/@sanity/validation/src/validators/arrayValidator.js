const deepEqual = require('fast-deep-equal')
const ValidationError = require('../ValidationError')
const genericValidator = require('./genericValidator')

const min = (minLength, value, message) => {
  if (value.length >= minLength) {
    return true
  }

  return new ValidationError(message || `Array must have at least ${minLength} items`)
}

const max = (maxLength, value, message) => {
  if (value.length <= maxLength) {
    return true
  }

  return new ValidationError(message || `Array must have at most ${maxLength} items`)
}

const length = (wantedLength, value, message) => {
  if (value.length === wantedLength) {
    return true
  }

  return new ValidationError(message || `Array must have exactly ${wantedLength} items`)
}

const presence = (flag, value, message) => {
  if (flag === 'required' && !value) {
    return new ValidationError(message || `This field is required`)
  }

  return true
}

const unique = (flag, value, message) => {
  const dupes = []
  // MEEH
}

module.exports = Object.assign({}, genericValidator, {
  presence,
  length,
  min,
  max,
})
