const Rule = require('./Rule')

function inferFromSchemaType(typeDef, options) {
  const typed = Rule[typeDef.type] && Rule[typeDef.type]
  const base = typed ? typed() : new Rule()
  const validation = {validation: inferValidation(typeDef, base)}
  const fields = typeDef.fields
    ? {fields: typeDef.fields.map(field => inferFromSchemaType(field, options))}
    : {}

  const ofTypes =
    typeDef.of && typeDef.type === 'array'
      ? {of: typeDef.of.map(candidate => inferFromSchemaType(candidate, options))}
      : {}

  return Object.assign({}, typeDef, fields, validation, ofTypes)
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
