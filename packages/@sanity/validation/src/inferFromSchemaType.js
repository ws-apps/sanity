const Rule = require('./Rule')

// eslint-disable-next-line complexity
function inferFromSchemaType(typeDef, isRoot = true) {
  if (typeDef.validation instanceof Rule) {
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
  // Pre-initialized rule
  if (field.validation && typeof field.validation.validate === 'function') {
    return baseRule.merge(field.validation)
  }

  // Lazy-instantiated
  if (field.validation && typeof field.validation === 'function') {
    return field.validation(baseRule)
  }

  return baseRule
}

module.exports = inferFromSchemaType
