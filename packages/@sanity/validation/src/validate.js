const {get} = require('lodash')
const ValidationError = require('./ValidationError')
const genericValidator = require('./validators/genericValidator')

const typeValidators = {
  Number: require('./validators/numberValidator'),
  String: require('./validators/stringValidator'),
  Array: require('./validators/arrayValidator'),
  Object: require('./validators/objectValidator'),
  Date: require('./validators/dateValidator')
}

module.exports = (rule, value, options = {}) => {
  const type = rule._type
  const validators = typeValidators[type] || genericValidator

  // Short-circuit on optional, empty fields
  if (!rule._required && (value === null || typeof value === 'undefined')) {
    return []
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

    let itemConstraint = curr.constraint
    if (itemConstraint && itemConstraint.type === rule.FIELD_REF) {
      if (!options.parent) {
        throw new Error('Field reference provided, but no parent received')
      }

      itemConstraint = get(options.parent, itemConstraint.path)
    }

    const result = validator(itemConstraint, value, rule._message)
    const hasError = result instanceof ValidationError
    if (hasError) {
      if (result.paths.length === 0) {
        // Add an item at "root" level (for arrays, the actual array)
        results.push({level: rule._level, item: result})
      }

      // Add individual items for each path
      result.paths.forEach(path => {
        results.push({path, level: rule._level, item: result})
      })
    }

    // In certain cases it might make more sense to throw as early as possible
    if (hasError && rule._level === 'error' && options.throwOnError) {
      throw result
    }

    return results
  }, [])
}
