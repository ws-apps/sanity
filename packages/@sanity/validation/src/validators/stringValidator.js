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

const stringCasing = (casing, value, message) => {
  const strValue = value || ''
  if (casing === 'uppercase' && strValue !== strValue.toLocaleUpperCase()) {
    return new ValidationError(message || `String must be all uppercase letters`)
  }

  if (casing === 'lowercase' && strValue !== strValue.toLocaleLowerCase()) {
    return new ValidationError(message || `String must be all lowercase letters`)
  }

  return true
}

const presence = (flag, value, message) => {
  if (flag === 'required' && !value) {
    return new ValidationError(message || `This field is required`)
  }

  return true
}

const regex = (options, value, message) => {
  const {pattern, name, invert} = options
  const regName = name || `"${pattern.toString()}"`
  const strValue = value || ''
  const matches = pattern.test(strValue)
  if ((!invert && !matches) || (invert && matches)) {
    const defaultMessage = invert
      ? `Value should not match ${regName}-pattern`
      : `Value does not match ${regName}-pattern`

    return new ValidationError(message || defaultMessage)
  }

  return true
}

module.exports = Object.assign({}, genericValidator, {
  stringCasing,
  presence,
  regex,
  min,
  max
})
