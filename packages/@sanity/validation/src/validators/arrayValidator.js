const deepEqual = require('fast-deep-equal')
const prefixPaths = require('../util/prefixPaths')
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

const items = (rule, values, message) => {
  const results = values.reduce(
    (acc, value, index) => {
      const result = prefixPaths(rule.validate(value), [index])
      acc.errors = acc.errors.concat(result.errors)
      acc.warnings = acc.warnings.concat(result.warnings)
      return acc
    },
    {errors: [], warnings: []}
  )

  return results.errors.length === 0 ? true : results.errors[0]
}

const unique = (flag, value, message) => {
  const dupeIndices = []

  /* eslint-disable max-depth */
  for (let x = 0; x < value.length; x++) {
    for (let y = x + 1; y < value.length; y++) {
      const itemA = value[x]
      const itemB = value[y]

      if (!deepEqual(itemA, itemB)) {
        continue
      }

      if (dupeIndices.indexOf(x) === -1) {
        dupeIndices.push(x)
      }

      if (dupeIndices.indexOf(y) === -1) {
        dupeIndices.push(y)
      }
    }
  }
  /* eslint-enable max-depth */

  const paths = dupeIndices.map(idx => [idx])
  return dupeIndices.length > 0
    ? new ValidationError(message || `Array cannot contain duplicate values`, {paths})
    : true
}

module.exports = Object.assign({}, genericValidator, {
  presence,
  unique,
  items,
  length,
  min,
  max
})
