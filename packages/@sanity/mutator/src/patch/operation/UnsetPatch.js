import {targetsToExistingIndicies} from './util'

export default class UnsetPatch {
  path : string
  value : any
  constructor(id : string, path : string) {
    this.id = id
    this.path = path
  }
  apply(targets, accessor, rootPath, changeSet) {
    let result = accessor
    switch (accessor.containerType()) {
      case 'array': {
        const indicies = targetsToExistingIndicies(targets, accessor)
        result = result.unsetIndices(indicies)
        indicies.slice().reverse().forEach(i => changeSet.unset(rootPath.concat(i)))
        break
      }
      case 'object':
        targets.forEach(target => {
          if (result.hasAttribute(target.name())) {
            result = result.unsetAttribute(target.name())
            changeSet.unset(rootPath.concat(target.name()))
          }
        })
        break
      default:
        throw new Error('Target value is neither indexable or an object. This error should potentially just be silently ignored?')
    }
    return result
  }
}
