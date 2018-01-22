const Rule = require('./Rule')

// eslint-disable-next-line complexity
function inferFromSchemaType(typeDef, isRoot = true) {
  if (typeDef.validation instanceof Rule) {
    return typeDef
  }

  const typed = Rule[typeDef.jsonType] && Rule[typeDef.jsonType]
  const base = typed ? typed() : new Rule()
  const type = typeDef.type

  typeDef.validation = inferValidation(typeDef, base)

  if (typeDef.fields) {
    typeDef.fields.forEach(field => inferFromSchemaType(field.type, false))
  }

  if (typeDef.of && typeDef.jsonType === 'array') {
    typeDef.of.forEach(candidate => inferFromSchemaType(candidate, false))
  }

  if (type && type.name === 'url') {
    typeDef.validation = typeDef.validation.url()
  }

  if (type && type.name === 'reference') {
    typeDef.validation = typeDef.validation.reference()
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
