function rawTargetsToIndicies(targets, accessor, onlyExisting) {
  const result = []
  targets.forEach(target => {
    if (target.isIndexReference()) {
      result.push(...target.toIndicies(accessor, onlyExisting))
    }
  })
  return result.sort()
}

// Convert targets to indicies, return even indicies not existing in the underlying array
export function targetsToIndicies(targets, accessor) {
  return rawTargetsToIndicies(targets, accessor, false)
}

// Convert targets to indicies, but only return indicies that actually exist in the underlying array
export function targetsToExistingIndicies(targets, accessor) {
  return rawTargetsToIndicies(targets, accessor, true)
}

// given a simple path array and a number of targets, returns a set of concrete paths
export function concatAllTargets(rootPath, targets) {
  const result = []
  targets.forEach(target => {
    if (target.isIndexReference()) {
      target.toIndicies().forEach(i => {
        result.push(rootPath.concat(i))
      })
    } else if (target.isAttributeReference()) {
      result.push(rootPath.concat(target.name()))
    }
  })
  return result
}
