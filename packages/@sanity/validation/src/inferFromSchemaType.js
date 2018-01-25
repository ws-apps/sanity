const Rule = require('./Rule')

// eslint-disable-next-line complexity
function inferFromSchemaType(typeDef, isRoot = true) {
  const isInitialized =
    Array.isArray(typeDef.validation) &&
    typeDef.validation.every(item => typeof item.validate === 'function')

  if (isInitialized) {
    return typeDef
  }

  const type = typeDef.type
  const typed = Rule[typeDef.jsonType] && Rule[typeDef.jsonType]
  let base = typed ? typed() : new Rule()

  if (type && type.name === 'datetime') {
    base = base.type('Date')
  }

  if (type && type.name === 'url') {
    base = base.uri()
  }

  if (type && type.name === 'reference') {
    base = base.reference()
  }

  if (type && type.name === 'email') {
    base = base.email()
  }

  typeDef.validation = inferValidation(typeDef, base)

  if (typeDef.fields) {
    typeDef.fields.forEach(field => inferFromSchemaType(field.type, false))
  }

  if (typeDef.of && typeDef.jsonType === 'array') {
    typeDef.of.forEach(candidate => inferFromSchemaType(candidate, false))
  }

  return typeDef
}

function inferValidation(field, baseRule) {
  if (!field.validation) {
    return [baseRule]
  }

  const validation =
    typeof field.validation === 'function' ? field.validation(baseRule) : field.validation

  return Array.isArray(validation)
    ? validation.map(rule => applyBaseRule(rule, baseRule))
    : [applyBaseRule(validation, baseRule)]
}

function applyBaseRule(validation, baseRule) {
  // Pre-initialized rule
  if (validation && typeof validation.validate === 'function') {
    return baseRule.merge(validation)
  }

  // Lazy-instantiated
  if (validation && typeof validation === 'function') {
    return validation(baseRule)
  }

  return baseRule
}

module.exports = inferFromSchemaType
