const Type = require('type-of-is')
const ValidationError = require('./ValidationError')

const validate = options => {
  const {value, flags, path} = options

  validateType(options)
}

function validateType(options) {
  const {value, flags, path} = options
  if (!flags.type) {
    return true
  }

  if (!Type.is(value, flags.type)) {
    throw new ValidationError(`Expected type "${flags.type}", got "${Type.string(value)}"`, path)
  }

  return true
}

module.exports = validate
