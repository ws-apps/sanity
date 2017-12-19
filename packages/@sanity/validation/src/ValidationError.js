const ExtendableError = require('es6-error')

class ValidationError extends ExtendableError {
  constructor(message, path = []) {
    super(message)
    this.path = path
    this.message = path.length > 0 ? `${this.message}\n @ ${this.serializePath()}` : this.message
  }

  serializePath() {
    return this.path.reduce((target, part, i) => {
      const isIndex = typeof part === 'number'
      const seperator = i === 0 ? '' : '.'
      const add = isIndex ? `[${part}]` : `${seperator}${part}`
      return `${target}${add}`
    }, '')
  }
}

module.exports = ValidationError
