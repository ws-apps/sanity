const Type = require('type-of-is')
const {flatten} = require('lodash')
const deepEquals = require('../util/deepEquals')
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

  const items = children.map(child => validate(child, value, {isChild: true}))
  return Promise.all(items).then(flatten)
}

const all = (children, value, message) =>
  multiple(children, value).then(results => {
    const numErrors = results.length
    return numErrors === 0
      ? true
      : formatValidationErrors(message, results, {separator: ' - AND - ', operator: 'AND'})
  })

const either = (children, value, message) =>
  multiple(children, value).then(results => {
    const numErrors = results.length

    // Read: There is at least one rule that matched
    return numErrors < children.length
      ? true
      : formatValidationErrors(message, results, {separator: ' - OR - ', operator: 'OR'})
  })

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

  return allowedValues.some(expected => deepEquals(expected, actual))
    ? true
    : new ValidationError(message || defaultMessage)
}

const custom = async (fn, value, message) => {
  let result
  try {
    result = await fn(value)
  } catch (err) {
    return `Error validating value: ${err.message}`
  }

  if (result === true) {
    return true
  }

  if (typeof result === 'string') {
    return new ValidationError(message || result)
  }

  if (result && (result.message && result.paths)) {
    return new ValidationError(message || result.message, {paths: result.paths})
  }

  throw new Error('Validator must return `true` if valid or a string with an error message')
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
  custom,
  presence
}
