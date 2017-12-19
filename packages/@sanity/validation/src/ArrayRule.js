const Rule = require('./Rule')

class ArrayRule extends Rule {
  constructor(...args) {
    super(...args)

    this._flags.type = 'Array'
  }

  items() {
    throw new Error('not yet implemented')
  }
}

module.exports = ArrayRule
