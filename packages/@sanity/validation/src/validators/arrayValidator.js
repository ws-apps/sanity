const deepEquals = require('../util/deepEquals')
const ValidationError = require('../ValidationError')
const genericValidator = require('./genericValidator')

const min = (minLength, value, message) => {
  if (!value || value.length >= minLength) {
    return true
  }

  return new ValidationError(message || `Must have at least ${minLength} items`)
}

const max = (maxLength, value, message) => {
  if (!value || value.length <= maxLength) {
    return true
  }

  return new ValidationError(message || `Must have at most ${maxLength} items`)
}

const length = (wantedLength, value, message) => {
  if (!value || value.length === wantedLength) {
    return true
  }

  return new ValidationError(message || `Must have exactly ${wantedLength} items`)
}

const presence = (flag, value, message) => {
  if (flag === 'required' && !value) {
    return new ValidationError(message || 'Required')
  }

  return true
}

const unique = (flag, value, message) => {
  const dupeIndices = []
  if (!value) {
    return true
  }

  /* eslint-disable max-depth */
  for (let x = 0; x < value.length; x++) {
    for (let y = x + 1; y < value.length; y++) {
      const itemA = value[x]
      const itemB = value[y]

      if (!deepEquals(itemA, itemB)) {
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

  const paths = dupeIndices.map(idx => {
    const item = value[idx]
    const pathSegment = item && item._key ? {_key: item._key} : idx
    return [pathSegment]
  })

  return dupeIndices.length > 0
    ? new ValidationError(message || `Can't be a duplicate`, {paths})
    : true
}

module.exports = Object.assign({}, genericValidator, {
  presence,
  unique,
  length,
  min,
  max
})
