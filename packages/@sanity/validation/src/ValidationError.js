const ExtendableError = require('es6-error')

function serializePath(path) {
  return path.reduce((target, part, i) => {
    const isIndex = typeof part === 'number'
    const separator = i === 0 ? '' : '.'
    const add = isIndex ? `[${part}]` : `${separator}${part}`
    return `${target}${add}`
  }, '')
}

class ValidationError extends ExtendableError {
  constructor(message, options = {}) {
    super(message)
    this.paths = options.paths || []
    this.children = options.children
    this.operation = options.operation
    this.message =
      this.paths.length > 0
        ? `${this.message}\n @ ${this.paths.map(serializePath).join('\n @ ')}`
        : this.message
  }
}

module.exports = ValidationError
