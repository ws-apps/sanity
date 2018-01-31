const Type = require('type-of-is')
const deepEqual = require('fast-deep-equal')
const ValidationError = require('../ValidationError')

const type = (expected, value, message) => {
  const actualType = Type.string(value)
  if (actualType !== expected && actualType !== 'undefined') {
    return new ValidationError(message || `Expected type "${expected}", got "${actualType}"`)
  }

  return true
}

const presence = (expected, value, message) => {
  if (typeof value === 'undefined' && expected === 'required') {
    return new ValidationError(message || 'Value is required')
  }

  return true
}

const multiple = (children, value) => {
  const validate = require('../validate')

  let results = []
  children.forEach(child => {
    results = results.concat(validate(child, value))
  })

  return results
}

const all = (children, value, message) => {
  const results = multiple(children, value)
  const numErrors = results.length
  return numErrors === 0
    ? true
    : formatValidationErrors(message, results, {separator: ' - AND - ', operator: 'AND'})
}

const either = (children, value, message) => {
  const results = multiple(children, value)
  const numErrors = results.length

  // Read: There is at least one rule that matched
  return numErrors < children.length
    ? true
    : formatValidationErrors(message, results, {separator: ' - OR - ', operator: 'OR'})
}

const valid = (allowedValues, actual, message) => {
  const valueType = typeof actual
  if (valueType === 'undefined') {
    return true
  }

  const value = (valueType === 'number' || valueType === 'string') && `${actual}`
  const strValue = value && value.length > 30 ? `${value.slice(0, 30)}…` : value

  const defaultMessage = value
    ? `Value "${strValue}" did not match any of allowed values`
    : 'Value did not match any of allowed values'

  return allowedValues.some(expected => deepEqual(expected, actual))
    ? true
    : new ValidationError(message || defaultMessage)
}

function formatValidationErrors(message, results, options = {}) {
  const errOpts = {
    children: results.length > 1 ? results : undefined,
    operator: options.operator
  }

  return results.length === 1
    ? new ValidationError(message || results[0].item.message, errOpts)
    : new ValidationError(
        message || `[${results.map(err => err.item.message).join(options.separator)}]`,
        errOpts
      )
}

module.exports = {
  all,
  type,
  either,
  valid,
  presence
}
