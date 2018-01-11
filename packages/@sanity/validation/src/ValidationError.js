const ExtendableError = require('es6-error')

class ValidationError extends ExtendableError {
  constructor(message, options = {}) {
    super(message)
    this.paths = options.paths || []
    this.children = options.children
    this.operation = options.operation
  }

  prefixPaths(prefix) {
    this.paths = this.paths.map(path => prefix.concat(path))
    return this
  }
}

module.exports = ValidationError
