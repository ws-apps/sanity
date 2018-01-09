const Type = require('type-of-is')

/* eslint-disable no-console */
module.exports = (doc, schema) => {
  return validateObject(doc, schema, [])
}

function validateItem(item, type, path) {
  if (Array.isArray(item)) {
    return validateArray(item, type, path)
  }

  if (typeof item === 'object') {
    return validateObject(item, type, path)
  }

  return validatePrimitive(item, type, path)
}

function validateObject(obj, schema, path) {
  let results = []
  const type = schema.get(obj._type)
  if (!type) {
    console.warn('Schema type for object type "%s" not found, skipping validation', obj._type)
    return results
  }

  // Validate actual object itself
  if (type.validation) {
    results = results.concat(applyPath(type.validation.validate(obj), path))
  }

  // Validate fields within object
  type.fields.forEach(field => {
    const validation = field.type.validation
    if (!validation) {
      return
    }

    const fieldPath = appendPath(path, field.name)
    const fieldResults = validateItem(obj[field.name], field.type, fieldPath)
    results = results.concat(applyPath(fieldResults, fieldPath))
  })

  return results
}

function validateArray(items, type, path) {
  // Validate actual array itself
  let results = []
  if (type.validation) {
    results = results.concat(applyPath(type.validation.validate(items), path))
  }

  // Validate items within array
  items.forEach((item, i) => {
    const validateArrayItem = resolveValidationForArrayItem(item, type.of)
    if (!validateArrayItem) {
      console.warn('Failed to resolve validator for item %o', item)
      return
    }

    results = results.concat(applyPath(validateArrayItem.validate(item), appendPath(path, i)))
  })

  return results
}

function validatePrimitive(item, type, path) {
  if (!type.validation) {
    return []
  }

  return type.validation.validate(item)
}

function resolveValidationForArrayItem(item, candidates) {
  let resolved

  const isPrimitive = !item._type
  if (isPrimitive) {
    const primitive = Type.string(item).toLowerCase()
    resolved = candidates.find(candidate => candidate.jsonType === primitive)
  } else {
    resolved = candidates.find(candidate => candidate.type.name === item._type)
  }

  return resolved && resolved.validation
}

function appendPath(base, next) {
  return base.concat(next)
}

function applyPath(results, path) {
  return results.map(result => Object.assign({path}, result))
}
