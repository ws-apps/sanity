// @flow

// A Change is a minimal object describing a change in a document. Unlike the rich expressive
// powers of the Patches, the expressive power of a change is a small as possible. Paths are arrays
// of strings and numbers describing a concrete path in a specific version of a document. Values
// are any value valid in a Sanity document.

// This class is used by the Patcher to report actual changes performed on a specific document

// Valid operations: set, unset, insert, create, delete

export default class Change {
  operation : String
  path : Array<Number|String>
  value : any
  constructor(operation : String, path : Array<Number|String>, value : any) {
    this.operation = operation
    this.path = path
    this.value = value
  }
}

