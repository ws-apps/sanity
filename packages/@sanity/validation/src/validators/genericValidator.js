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

  let result = {warnings: [], errors: []}
  children.forEach(child => {
    result = validate(child, value, {initial: result})
  })

  return result
}

const all = (children, value, message) => {
  const result = multiple(children, value)
  const numErrors = result.errors.length
  return numErrors === 0
    ? true
    : formatValidationErrors(message, result, {separator: ' - AND - ', operator: 'AND'})
}

const either = (children, value, message) => {
  const result = multiple(children, value)
  const numErrors = result.errors.length

  // Read: There is at least one rule that matched
  return numErrors < children.length
    ? true
    : formatValidationErrors(message, result, {separator: ' - OR - ', operator: 'OR'})
}

const valid = (allowedValues, actual, message) => {
  return allowedValues.some(expected => deepEqual(expected, actual))
    ? true
    : new ValidationError(message || 'Value did not match any of allowed values')
}

function formatValidationErrors(message, result, options = {}) {
  const errOpts = {
    children: result.errors.length > 1 ? result.errors : undefined,
    operator: options.operator
  }

  return result.errors.length === 1
    ? new ValidationError(message || result.errors[0].message, errOpts)
    : new ValidationError(
        message || `[${result.errors.map(err => err.message).join(options.separator)}]`,
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
