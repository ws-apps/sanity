const cloneDeep = require('clone-deep')
const genericValidator = require('./validators/genericValidator')

let ruleTypes

const initTypes = () => {
  if (!ruleTypes) {
    ruleTypes = {
      Array: require('./ArrayRule'),
      String: require('./StringRule')
    }
  }

  return ruleTypes
}

class Rule {
  static array = () => new Rule().type('Array')
  static string = () => new Rule().type('String')

  constructor() {
    this._flags = getDefaultFlags()
    this._errorMessages = {}
    this._prevSetFlags = []
    this._validators = [genericValidator]
  }

  type(targetType) {
    initTypes()

    const type = `${targetType.slice(0, 1).toUpperCase()}${targetType.slice(1)}`

    if (!ruleTypes[type]) {
      throw new Error(`Unknown type "${type}"`)
    }

    const rule = this.clone(ruleTypes[type])
    rule._flags.type = type
    return rule
  }

  error(message) {
    const errFlags = this._prevSetFlags.length > 0 ? this._prevSetFlags : ['#root']
    Object.keys(errFlags).forEach(flag => {
      this._errorMessages[flag] = message
    })
  }

  required() {
    return this.cloneWithFlags({presence: 'required'})
  }

  clone(toType) {
    const TypedRule = toType || this.constructor
    const rule = new TypedRule()
    rule._flags = cloneDeep(this._flags)
    rule._errorMessages = cloneDeep(this._errorMessages)
    return rule
  }

  cloneWithFlags(flags) {
    const rule = this.clone()
    Object.assign(rule._flags, flags)
    rule._prevSetFlags = Object.keys(flags)
    return rule
  }

  validate(value) {
    Object.keys(this._flags).forEach(flag => {
      if (typeof this._flags[flag] === 'undefined') {
        return
      }

      let validatorsMatched = 0
      for (let i = 0; i < this._validators.length; i++) {
        const validator = this._validators[i][flag]
        if (!validator) {
          continue
        }

        validator(this._flags[flag], value, this._errorMessages[flag])
        validatorsMatched++
      }

      if (validatorsMatched === 0) {
        throw new Error(`No validators found for flag "${flag}"`)
      }
    })
  }
}

function getDefaultFlags() {
  return {}
}

module.exports = Rule
