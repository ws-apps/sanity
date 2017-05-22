export default class IncPatch {
  path : string
  value : number
  id : string
  constructor(id : string, path : string, value : number) {
    this.path = path
    this.value = value
    this.id = id
  }
  // TODO: Validate old value and not crash if it is not a number (what would Gradient do?)
  apply(targets, accessor, rootPath, changeSet) {
    let result = accessor
    targets.forEach(target => {
      if (target.isIndexReference()) {
        target.toIndicies(accessor).forEach(i => {
          const previousValue = result.getIndex(i).get()
          const nextValue = previousValue + this.value
          result = result.setIndex(i, nextValue)
          changeSet.set(rootPath.concat(i), nextValue)
        })
      } else if (target.isAttributeReference()) {
        const previousValue = result.getAttribute(target.name()).get()
        const nextValue = previousValue + this.value
        result = result.setAttribute(target.name(), previousValue + this.value)
        changeSet.set(rootPath.concat(target.name()), nextValue)
      } else {
        throw new Error(`Unable to apply to target ${target.toString()}`)
      }
    })
    return result
  }
}
