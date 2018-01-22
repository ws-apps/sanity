const URL = require('url-parse')
const ValidationError = require('../ValidationError')
const genericValidator = require('./genericValidator')
const createUriRegex = require('../util/createUriRegex')

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const min = (minLength, value, message) => {
  if (!value || value.length >= minLength) {
    return true
  }

  return new ValidationError(message || `String must be at least ${minLength} characters long`)
}

const max = (maxLength, value, message) => {
  if (!value || value.length <= maxLength) {
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
const uri = (constraints, value, message) => {
  const strValue = value || ''
  const {options, regex} = constraints
  const {allowCredentials, relativeOnly} = options

  const matchesConstraint = regex.test(strValue)
  if (matchesConstraint) {
    const url = new URL(strValue, true)
    if (!allowCredentials && url.auth) {
      return new ValidationError(
        message || `String is not a valid URL - username/password not allowed`
      )
    }

    return true
  }

  const isValidUri = createUriRegex().test(strValue)
  if (!isValidUri) {
    return new ValidationError(message || 'String is not a valid URL')
  }

  if (relativeOnly) {
    return new ValidationError(message || 'Only relative URLs are allowed')
  }

  return new ValidationError(message || 'URL does not match allowed protocols/schemes')
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

const email = (options, value, message) => {
  const strValue = `${value || ''}`.trim()
  if (!strValue || emailRegex.test(strValue)) {
    return true
  }

  return new ValidationError(message || 'Must be a valid email address')
}

module.exports = Object.assign({}, genericValidator, {
  stringCasing,
  presence,
  regex,
  length,
  email,
  min,
  max,
  uri
})
