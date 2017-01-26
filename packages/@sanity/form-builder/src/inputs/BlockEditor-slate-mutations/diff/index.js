import Immutable from 'immutable'
import {op, isMap, isIndexed} from './utils'
import * as lcs from './lcs'

function concatPath(path1, path2) {
  return (path1 || []).concat(path2 || [])
}

const mapDiff = function (a, b, p) {
  let ops = []
  const path = p || ''

  if (Immutable.is(a, b) || (a == b == null)) {
    return ops
  }

  const areLists = isIndexed(a) && isIndexed(b)
  let lastKey = null
  let removeKey = null

  if (a.forEach) {
    a.forEach((aValue, aKey) => {
      if (b.has(aKey)) {
        if (isMap(aValue) && isMap(b.get(aKey))) {
          ops = ops.concat(mapDiff(aValue, b.get(aKey), concatPath(path, escape(aKey))))
        } else if (isIndexed(b.get(aKey)) && isIndexed(aValue)) {
          ops = ops.concat(sequenceDiff(aValue, b.get(aKey), concatPath(path, escape(aKey))))
        } else {
          const bValue = b.get ? b.get(aKey) : b
          const areDifferentValues = (aValue !== bValue)
          if (areDifferentValues) {
            ops.push(op('replace', concatPath(path, escape(aKey)), bValue))
          }
        }
      } else if (areLists) {
        removeKey = (lastKey != null && (lastKey + 1) === aKey) ? removeKey : aKey
        ops.push(op('remove', concatPath(path, escape(removeKey))))
        lastKey = aKey
      } else {
        ops.push(op('remove', concatPath(path, escape(aKey))))
      }
    })
  }

  b.forEach((bValue, bKey) => {
    if (a.has && !a.has(bKey)) {
      ops.push(op('add', concatPath(path, escape(bKey)), bValue))
    }
  })

  return ops
}

const sequenceDiff = function (value, nextValue, path = []) {
  let ops = []
  if (Immutable.is(value, nextValue) || (value === nextValue || (value === null && nextValue === null))) {
    return ops
  }
  if ((value.count() + 1) * (nextValue.count() + 1) >= 10000) {
    return mapDiff(value, nextValue, path)
  }

  const lcsDiff = lcs.diff(value, nextValue)

  let pathIndex = 0

  lcsDiff.forEach(diff => {
    if (diff.op === '=') {
      pathIndex++
    } else if (diff.op === '!=') {
      if (isMap(diff.val) && isMap(diff.newVal)) {
        const mapDiffs = mapDiff(diff.val, diff.newVal, concatPath(path, pathIndex))
        ops = ops.concat(mapDiffs)
      } else {
        ops.push(op('replace', concatPath(path, pathIndex), diff.newVal))
      }
      pathIndex++
    } else if (diff.op === '+') {
      ops.push(op('add', concatPath(path, pathIndex), diff.val))
      pathIndex++
    } else if (diff.op === '-') {
      ops.push(op('remove', concatPath(path, pathIndex)))
    }
  })

  return ops
}

function diffNodes(nodes, nextNodes) {
  const ops = []
  nodes.forEach((node, index) => {
    const nextNode = nextNodes.get(index)
    if (Immutable.is(node, nextNodes.get(index))) {
      console.log('same')
    } else {
      console.log('different', node, nextNode)
    }
  })
}

function primitiveTypeDiff(value, nextValue, path = []) {
  if (value === nextValue) {
    return []
  }
  return [op('replace', path, nextValue)]
}

export default function diff(doc, nextDoc) {
  if (doc === nextDoc || Immutable.is(doc, nextDoc)) {
    return []
  }

  return Immutable.fromJS(sequenceDiff(doc.nodes, nextDoc.nodes))
}
