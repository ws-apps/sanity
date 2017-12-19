const stringValidator = require('./validators/stringValidator')
const Rule = require('./Rule')

class StringRule extends Rule {
  constructor(...args) {
    super(...args)

    this._flags.type = 'String'
    this._prevSetFlags = ['type']
    this._validators = this._validators.concat(stringValidator)
  }

  type() {
    throw new Error('Cannot change type of rule after creation, please use `Rule.<type>()` instead')
  }

  min(len) {
    return this.cloneWithFlags({min: len})
  }

  max(len) {
    return this.cloneWithFlags({max: len})
  }
}

module.exports = StringRule
