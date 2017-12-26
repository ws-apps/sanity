const Type = require('type-of-is')
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

const all = (children, value, message) => {
  const validate = require('../validate')

  let result = {warnings: [], errors: []}
  children.forEach(child => {
    result = validate(child, value, {initial: result})
  })

  const numErrors = result.errors.length

  if (numErrors === 0) {
    return true
  }

  if (numErrors === 1) {
    return new ValidationError(message || result.errors[0].message)
  }

  return new ValidationError(message || result.errors.map(err => `\n- ${err.message}`).join(''))
}

module.exports = {
  all,
  type,
  presence
}
