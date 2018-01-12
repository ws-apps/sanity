const URL = require('url-parse')
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

const length = (wantedLength, value, message) => {
  const strValue = value || ''
  if (strValue.length === wantedLength) {
    return true
  }

  return new ValidationError(message || `String must be exactly ${wantedLength} characters long`)
}

// eslint-disable-next-line complexity
const url = (options, value, message) => {
  const schemes = options.schemes || ['http', 'https']
  const allowCredentials = Boolean(options.allowCredentials)

  const [, proto] = value.match(/^(\w+):\/\//) || []
  if (!proto) {
    return new ValidationError(message || `String is not a valid URL - no protocol defined`)
  }

  if (!schemes.includes(proto)) {
    return new ValidationError(
      message || `String is not a valid URL - protocol "${proto}" not allowed`
    )
  }

  const uri = new URL(value, true)
  if (!allowCredentials && uri.auth) {
    return new ValidationError(
      message || `String is not a valid URL - username/password not allowed`
    )
  }

  return true
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
  length,
  min,
  max,
  url
})
