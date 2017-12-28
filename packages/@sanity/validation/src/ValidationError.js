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
  constructor(message, paths = []) {
    super(message)
    this.paths = paths
    this.message =
      paths.length > 0
        ? `${this.message}\n @ ${paths.map(serializePath).join('\n @ ')}`
        : this.message
  }
}

module.exports = ValidationError
