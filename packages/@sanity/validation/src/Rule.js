const cloneDeep = require('clone-deep')
const genericValidator = require('./validators/genericValidator')
const ValidationError = require('./ValidationError')

const typeValidators = {
  String: require('./validators/stringValidator')
}

const knownTypes = ['Object', 'String', 'Number', 'Boolean', 'Array']

class Rule {
  static array = () => new Rule().type('Array')
  static string = () => new Rule().type('String')

  constructor() {
    this._type = null
    this._message = null
    this._rules = []
    this._level = 'error'
  }

  error(message) {
    const rule = this.clone()
    rule._level = 'error'
    rule._message = message || null
    return rule
  }

  warning(message) {
    const rule = this.clone()
    rule._level = 'warning'
    rule._message = message || null
    return rule
  }

  clone() {
    const rule = new Rule()
    rule._type = this._type
    rule._level = this._level
    rule._message = this._message
    rule._rules = cloneDeep(this._rules)
    return rule
  }

  cloneWithRules(rules) {
    const rule = this.clone()
    const flags = rule._rules.map(curr => curr.flag)
    rule._rules = rule._rules.filter(curr => !flags.includes(curr.flag)).concat(rules)
    return rule
  }

  concat(rule) {
    if (this._type && rule._type && this._type !== rule._type) {
      throw new Error('concat() failed: conflicting types')
    }

    return this.cloneWithRules(rule._rules)
  }

  validate(value, options = {}) {
    const type = this._type
    const validators = typeValidators[type] || genericValidator
    return this._rules.reduce(
      (results, rule) => {
        if (typeof rule.flag === 'undefined') {
          throw new Error('Invalid rule, did not contain "flag"-property')
        }

        const validator = validators[rule.flag]
        if (!validator) {
          throw new Error(`Validator for flag "${rule.flag}" not found for type "${type}"`)
        }

        // If we encounter any "errors", push it to the `errors` or `warnings` based on the
        // flagged type for this rule. The default is error, but the user might de-escalate
        // it to a warning
        const result = validator(rule.constraint, value, this._message)
        const hasError = result instanceof ValidationError
        if (hasError && this._level === 'error') {
          results.errors.push(result)
        } else if (hasError) {
          results.warnings.push(result)
        }

        // In certain cases it might make more sense to throw as early as possible
        if (hasError && this._level === 'error' && options.throwOnError) {
          throw result
        }

        return results
      },
      {warnings: [], errors: []}
    )
  }

  // Validation flag setters
  type(targetType) {
    const type = `${targetType.slice(0, 1).toUpperCase()}${targetType.slice(1)}`
    if (!knownTypes.includes(type)) {
      throw new Error(`Unknown type "${targetType}"`)
    }

    const rule = this.cloneWithRules([{flag: 'type', constraint: type}])
    rule._type = type
    return rule
  }

  required() {
    return this.cloneWithRules([{flag: 'presence', constraint: 'required'}])
  }

  min(len) {
    return this.cloneWithRules([{flag: 'min', constraint: len}])
  }

  max(len) {
    return this.cloneWithRules([{flag: 'max', constraint: len}])
  }
}

module.exports = Rule
