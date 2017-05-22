import Change from './Change'

// A ChangeSet is a list of changes and is used by the Patcher to report the actual changes
// effected when executing a patch. The change set is cumulative and you can supply the same
// object to a series of patch operations to collect the changes from all of them.

export default class ChangeSet {
  changes : Array<Change>
  constructor() {
    this.changes = []
  }
  assertNoFail() {
    if (this.failed) {
      throw new Error('Attempt to add new changes to a failed change set')
    }
  }
  // Replace the value at path with value
  set(path : Array<Number|String>, value : any) {
    this.assertNoFail()
    this.changes.push(new Change('set', path, value))
    return this
  }
  // Insert the array elements in value at the path (which must end with an index)
  insert(path : Array<Number|String>, value : any) {
    this.assertNoFail()
    this.changes.push(new Change('insert', path, value))
    return this
  }
  // Remove the item at path
  unset(path : Array<Number|String>) {
    this.assertNoFail()
    this.changes.push(new Change('unset', path))
    return this
  }
  // Replace the entire contents of the document with the value
  create(value : Object) {
    this.assertNoFail()
    this.changes.push(new Change('create', [], value))
    return this
  }
  // Delete the document
  delete() {
    this.assertNoFail()
    this.changes.push(new Change('delete'))
    return this
  }
  fail() {
    this.changes = []
    this.failed = true
    return this
  }
}
