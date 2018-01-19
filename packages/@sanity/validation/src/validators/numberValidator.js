const ValidationError = require('../ValidationError')
const genericValidator = require('./genericValidator')

const precisionRx = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/

const integer = (unused, value, message) => {
  if (Number.isInteger(value)) {
    return new ValidationError(message || 'Number must be an integer')
  }

  return true
}

const precision = (limit, value, message) => {
  const prec = Math.pow(10, limit)
  const fixed = Math.round(value * prec) / prec

  const places = fixed.toString().match(precisionRx)
  const decimals = Math.max(
    (places[1] ? places[1].length : 0) - (places[2] ? parseInt(places[2], 10) : 0),
    0
  )

  if (decimals > limit) {
    throw new ValidationError(message || `Max precision is ${limit}`)
  }

  return true
}

const min = (minNum, value, message) => {
  if (value >= minNum) {
    return true
  }

  return new ValidationError(message || `Number must be higher than or equal ${minNum}`)
}

const max = (maxNum, value, message) => {
  if (value.length <= maxNum) {
    return true
  }

  return new ValidationError(message || `Number must be lower than or equal ${maxNum}`)
}

module.exports = Object.assign({}, genericValidator, {
  min,
  max,
  integer,
  precision
})
