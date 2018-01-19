const cloneDeep = require('clone-deep')
const validate = require('./validate')

const knownTypes = ['Object', 'String', 'Number', 'Boolean', 'Array']

class Rule {
  static object = () => new Rule().type('Object')
  static array = () => new Rule().type('Array')
  static string = () => new Rule().type('String')
  static number = () => new Rule().type('Number')
  static boolean = () => new Rule().type('Boolean')

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
      throw new Error('merge() failed: conflicting types')
    }

    return this.cloneWithRules(rule._rules)
  }

  validate(value, options = {}) {
    return validate(this, value, options)
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

  either(children) {
    return this.cloneWithRules([{flag: 'either', constraint: children}])
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
    return this.cloneWithRules([{flag: 'length', constraint: len}])
  }

  valid(value) {
    const values = Array.isArray(value) ? value : [value]
    return this.cloneWithRules([{flag: 'valid', constraint: values}])
  }

  // Numbers only
  integer() {
    return this.cloneWithRules([{flag: 'integer'}])
  }

  precision(limit) {
    return this.cloneWithRules([{flag: 'precision', constraint: limit}])
  }

  positive() {
    return this.cloneWithRules([{flag: 'min', constraint: 0}])
  }

  negative() {
    return this.cloneWithRules([{flag: 'lessThan', constraint: 0}])
  }

  greaterThan(num) {
    return this.cloneWithRules([{flag: 'greaterThan', constraint: num}])
  }

  lessThan(num) {
    return this.cloneWithRules([{flag: 'lessThan', constraint: num}])
  }

  // String only
  url(options = {}) {
    return this.cloneWithRules([{flag: 'url', constraint: options}])
  }

  uppercase() {
    return this.cloneWithRules([{flag: 'stringCasing', constraint: 'uppercase'}])
  }

  lowercase() {
    return this.cloneWithRules([{flag: 'stringCasing', constraint: 'lowercase'}])
  }

  regex(pattern, name, opts) {
    let options = opts || {name}
    if (!opts && name && (name.name || name.invert)) {
      options = name
    }

    const constraint = Object.assign({}, options, {pattern})
    return this.cloneWithRules([{flag: 'regex', constraint}])
  }

  // Array only
  unique(comparator) {
    return this.cloneWithRules([{flag: 'unique', constraint: comparator}])
  }
}

module.exports = Rule
