import Immutable from 'immutable'

export function isMap(obj) {
  return Immutable.Iterable.isKeyed(obj)
}

export function isIndexed(obj) {
  return Immutable.Iterable.isIndexed(obj)
}

export function op(operation, path, value) {
  if (operation === 'remove') {
    return {op: operation, path: path}
  }
  return {op: operation, path: path, value: value}
}
