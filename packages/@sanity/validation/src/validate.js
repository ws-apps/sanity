const ValidationError = require('./ValidationError')
const genericValidator = require('./validators/genericValidator')

const typeValidators = {
  String: require('./validators/stringValidator'),
  Array: require('./validators/arrayValidator'),
  Object: require('./validators/objectValidator')
}

module.exports = (rule, value, options = {}) => {
  const type = rule._type
  const validators = typeValidators[type] || genericValidator
  const initial = options.initial || []

  // Short-circuit on optional, empty fields
  if (!rule._required && (value === null || typeof value === 'undefined')) {
    return initial
  }

  // eslint-disable-next-line complexity
  return rule._rules.reduce((results, curr) => {
    if (typeof curr.flag === 'undefined') {
      throw new Error('Invalid rule, did not contain "flag"-property')
    }

    const validator = validators[curr.flag]
    if (!validator) {
      const forType = type ? `type "${type}"` : 'rule without declared type'
      throw new Error(`Validator for flag "${curr.flag}" not found for ${forType}`)
    }

    // If we encounter any "errors", push it to the `errors` or `warnings` based on the
    // flagged type for this rule. The default is error, but the user might de-escalate
    // it to a warning
    const result = validator(curr.constraint, value, rule._message)
    const hasError = result instanceof ValidationError
    if (hasError) {
      results.push({level: rule._level, item: result})
    }

    // In certain cases it might make more sense to throw as early as possible
    if (hasError && rule._level === 'error' && options.throwOnError) {
      throw result
    }

    return results
  }, initial)
}
