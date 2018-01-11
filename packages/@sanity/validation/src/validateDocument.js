const Type = require('type-of-is')

/* eslint-disable no-console */
module.exports = (doc, schema) => {
  const type = schema.get(doc._type)
  if (!type) {
    console.warn('Schema type for object type "%s" not found, skipping validation', doc._type)
    return []
  }

  return validateItem(doc, type, [], schema)
}

function validateItem(item, type, path, schema) {
  if (Array.isArray(item)) {
    return validateArray(item, type, path, schema)
  }

  if (typeof item === 'object') {
    return validateObject(item, type, path, schema)
  }

  return validatePrimitive(item, type, path, schema)
}

function validateObject(obj, type, path, schema) {
  let results = []

  // Validate actual object itself
  if (type.validation) {
    results = results.concat(type.validation.validate(obj))
  }

  // Validate fields within object
  type.fields.forEach(field => {
    const validation = field.type.validation
    if (!validation) {
      return
    }

    const fieldPath = appendPath(path, field.name)
    const fieldResults = validateItem(obj[field.name], field.type, fieldPath, schema)
    results = results.concat(fieldResults)
  })

  return results
}

function validateArray(items, type, path, schema) {
  // Validate actual array itself
  let results = []
  if (type.validation) {
    results = results.concat(applyPath(type.validation.validate(items), path))
  }

  // Validate items within array
  items.forEach((item, i) => {
    const itemType = resolveTypeForArrayItem(item, type.of)
    const itemResults = validateItem(item, itemType, appendPath(path, [i]), schema)
    results = results.concat(itemResults)
  })

  return results
}

function validatePrimitive(item, type, path) {
  if (!type.validation) {
    return []
  }

  return applyPath(type.validation.validate(item), path)
}

function resolveTypeForArrayItem(item, candidates) {
  const primitive = !item._type && Type.string(item).toLowerCase()
  return primitive
    ? candidates.find(candidate => candidate.jsonType === primitive)
    : candidates.find(candidate => candidate.type.name === item._type)
}

function appendPath(base, next) {
  return base.concat(next)
}

function applyPath(results, pathPrefix) {
  return results.map(result => {
    const path = typeof result.path === 'undefined' ? pathPrefix : pathPrefix.concat(result.path)
    return Object.assign({type: 'validation'}, result, {path})
  })
}
