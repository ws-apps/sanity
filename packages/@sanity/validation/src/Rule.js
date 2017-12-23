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
    this._required = false
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
    const newRules = new Set()

    rules.forEach(curr => {
      if (curr.flag === 'type') {
        rule._type = curr.constraint
      }

      newRules.add(curr.flag)
    })

    rule._rules = rule._rules.filter(curr => !newRules.has(curr.flag)).concat(rules)
    return rule
  }

  merge(rule) {
    if (this._type && rule._type && this._type !== rule._type) {
      throw new Error('concat() failed: conflicting types')
    }

    return this.cloneWithRules(rule._rules)
  }

  validate(value, options = {}) {
    const type = this._type
    const validators = typeValidators[type] || genericValidator
    const initial = {warnings: [], errors: []}

    // Short-circuit on optional fields
    if (!this._required && (value === null || typeof value === 'undefined')) {
      return initial
    }

    return this._rules.reduce(
      (results, rule) => {
        if (typeof rule.flag === 'undefined') {
          throw new Error('Invalid rule, did not contain "flag"-property')
        }

        const validator = validators[rule.flag]
        if (!validator) {
          const forType = type ? `type "${type}"` : 'rule without declared type'
          throw new Error(`Validator for flag "${rule.flag}" not found for ${forType}`)
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
      initial
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

  all(children) {
    return this.cloneWithRules([{flag: 'all', constraint: children}])
  }

  optional() {
    const rule = this.cloneWithRules([{flag: 'presence', constraint: 'required'}])
    rule._required = false
    return rule
  }

  required() {
    const rule = this.cloneWithRules([{flag: 'presence', constraint: 'required'}])
    rule._required = true
    return rule
  }

  min(len) {
    return this.cloneWithRules([{flag: 'min', constraint: len}])
  }

  max(len) {
    return this.cloneWithRules([{flag: 'max', constraint: len}])
  }

  length(len) {
    this._assertIsType(['String', 'Array'], 'length')
    return this.cloneWithRules([{flag: 'length', constraint: len}])
  }

  // String only
  uppercase() {
    this._assertIsType(['String'], 'uppercase')
    return this.cloneWithRules([{flag: 'stringCasing', constraint: 'uppercase'}])
  }

  lowercase() {
    this._assertIsType(['String'], 'lowercase')
    return this.cloneWithRules([{flag: 'stringCasing', constraint: 'lowercase'}])
  }

  regex(pattern, name, opts) {
    let options = opts || {name}
    if (!opts && name && (name.name || name.invert)) {
      options = name
    }

    const constraint = Object.assign({}, options, {pattern})
    this._assertIsType(['String'], 'regex')
    return this.cloneWithRules([{flag: 'regex', constraint}])
  }

  // Array only
}

module.exports = Rule
