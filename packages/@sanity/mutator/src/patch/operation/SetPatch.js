export default class SetPatch {
  path : string
  value : any
  constructor(id : string, path : string, value : any) {
    this.id = id
    this.path = path
    this.value = value
  }
  apply(targets, accessor, rootPath, changeSet) {
    let result = accessor
    targets.forEach(target => {
      if (target.isSelfReference()) {
        result = result.set(this.value)
        changeSet.set(rootPath, this.value)
      } else if (target.isIndexReference()) {
        target.toIndicies(accessor).forEach(i => {
          result = result.setIndex(i, this.value)
          changeSet.set(rootPath.concat(i), this.value)
        })
      } else if (target.isAttributeReference()) {
        result = result.setAttribute(target.name(), this.value)
        changeSet.set(rootPath.concat(target.name()), this.value)
      } else {
        throw new Error(`Unable to apply to target ${target.toString()}`)
      }
    })
    return result
  }
}
