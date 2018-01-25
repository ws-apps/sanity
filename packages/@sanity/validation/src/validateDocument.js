const Type = require('type-of-is')

/* eslint-disable no-console */
module.exports = (doc, schema) => {
  const type = schema.get(doc._type)
  if (!type) {
    console.warn('Schema type for object type "%s" not found, skipping validation', doc._type)
    return []
  }

  return validateItem(doc, type, [], {})
}

function validateItem(item, type, path, options) {
  if (Array.isArray(item)) {
    return validateArray(item, type, path, options)
  }

  if (typeof item === 'object') {
    return validateObject(item, type, path, options)
  }

  return validatePrimitive(item, type, path, options)
}

function validateObject(obj, type, path, options) {
  let results = []

  // Validate actual object itself
  if (type.validation) {
    results = type.validation.reduce((acc, rule) => {
      const ruleResults = rule.validate(obj, {parent: options.parent})
      return acc.concat(applyPath(ruleResults, path))
    }, results)
  }

  // Validate fields within object
  const fields = type.fields || []
  fields.forEach(field => {
    const validation = field.type.validation
    if (!validation) {
      return
    }

    const fieldPath = appendPath(path, field.name)
    const fieldValue = obj[field.name]
    const fieldResults = validateItem(fieldValue, field.type, fieldPath, {parent: obj})
    results = results.concat(fieldResults)
  })

  return results
}

function validateArray(items, type, path, options) {
  // Validate actual array itself
  let results = []
  if (type.validation) {
    results = type.validation.reduce((acc, rule) => {
      const ruleResults = rule.validate(items, {parent: options.parent})
      return acc.concat(applyPath(ruleResults, path))
    }, results)
  }

  // Validate items within array
  items.forEach((item, i) => {
    const pathSegment = item._key ? {_key: item._key} : i
    const itemType = resolveTypeForArrayItem(item, type.of)
    const itemPath = appendPath(path, [pathSegment])
    const itemResults = validateItem(item, itemType, itemPath, {parent: items})
    results = results.concat(itemResults)
  })

  return results
}

function validatePrimitive(item, type, path, options) {
  if (!type.validation) {
    return []
  }

  return type.validation.reduce((acc, rule) => {
    const ruleResults = rule.validate(item, {parent: options.parent})
    return acc.concat(applyPath(ruleResults, path))
  }, [])
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
