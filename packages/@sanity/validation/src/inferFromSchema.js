const Rule = require('./Rule')

function inferFromSchemaType(typeDef, options) {
  if (typeDef.type === 'array') {
    return inferFromArray(typeDef, options)
  }

  const fields = typeDef.fields
    ? {fields: typeDef.fields.map(field => inferFromSchemaType(field, options))}
    : {}

  const typed = Rule[typeDef.type] && Rule[typeDef.type]
  const base = typed ? typed() : new Rule()

  return Object.assign({}, typeDef, fields, {
    validation: initValidation(typeDef, base)
  })
}

// eslint-disable-next-line complexity
function inferFromArray(typeDef, options) {
  const {schemaTypes} = options
  const typeRules = []
  const candidates = typeDef.of || []
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]

    // Anonymous objects - should probably be more strictly validated
    if (candidate.type === 'object' && !candidate.name) {
      typeRules.push(Rule.object().required())
      continue
    }

    const schemaType = schemaTypes.find(type => type.name === candidate.name)

    // Arrays of arrays? Rare, but allow it
    if (schemaType && schemaType.jsonType === 'array') {
      typeRules.push(inferFromArray(candidate, options))
      continue
    }

    // String, numbers etc...
    if (schemaType && schemaType.jsonType !== 'object') {
      const typed = Rule[schemaType.jsonType] && Rule[schemaType.jsonType]
      const rule = typed ? typed() : new Rule()
      typeRules.push(rule.required())
      continue
    }

    // Named object types
    typeRules.push(
      Rule.object().keys({
        _type: Rule.string().valid(candidate.type)
      })
    )
  }

  return Rule.array().items(candidates.length === 1 ? candidates[0] : new Rule().either(candidates))
}

function initValidation(field, baseRule) {
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
