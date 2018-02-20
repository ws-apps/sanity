// @flow
import type {Type, Span, Block, SlateValue} from '../typeDefs'
import {blocksToEditorValue} from '@sanity/block-tools'
import {Text, Value, Block as SlateBlock} from 'slate'

type Path = string | {_key: string}

type Patch = {
  type: string,
  path: Path[]
}

function findFirstKey(path: Path[]) {
  const match = path.find(part => part.hasOwnProperty('_key'))
  if (match) {
    return match._key || null
  }
  return null
}

function findLastKey(path: Path[]) {
  let key = null
  path.forEach(part => {
    if (part._key) {
      key = part._key
    }
  })
  return key
}

function findPatchedBlock(patch, blocks) {
  const firstKey = findFirstKey(patch.path)
  return blocks.find((blk: Block) => blk._key === firstKey) || null
}

function findPatchedSpan(patch, blocks) {
  const block = findPatchedBlock(patch, blocks)
  const lastKey = findLastKey(patch.path)
  return block && block.children
    ? block.children.find((spn: Span) => spn._key === lastKey)
    : null
}

function findPatchedNodeByKey(key: string, blocks: Block[]) {
  let node
  blocks.forEach(block => {
    if (block._key === key) {
      node = block
      return
    }
    block.children && block.children.forEach(child => {
      if (child._key === key) {
        node = child
        return
      }
    })
  })
  return node
}

function replaceTextByKey(change, key, span) {
  const newText = Text.create({
    text: span.text,
    key: key,
    marks: span.marks.map(name => ({type: name}))
  })
  change.replaceNodeByKey(key, newText)
}

function diffMatchPatch(patch: Patch, change: () => void, blocks: Block[]) {
  const lastKey = findLastKey(patch.path)
  const span = findPatchedSpan(patch, blocks)
  change.call(replaceTextByKey, lastKey, span)
}

function setPatch(patch: Patch, change: () => void, blocks: Block[], type: Type) {
  const lastKey = findLastKey(patch.path)
  const node = findPatchedNodeByKey(lastKey, blocks)
  console.log('node', node)
  if (!node || node._type === 'block') {
    const value = blocksToEditorValue([node], type)
    const block = SlateBlock.fromJSON(value.document.nodes[0])
    console.log('value', value)
    console.log(lastKey, value.document.nodes[0])
    if (node) {
      console.log(block)
      change.replaceNodeByKey(lastKey, block)
    } else {
      change.insertBlock(block)
    }
    return change
  }
}

function insertPatch(patch: Patch, change: () => void, blocks: Block[], type: Type) {
  console.log(patch)
  // const lastKey = findLastKey(patch.path)
  // const node = findPatchedNodeByKey(lastKey, blocks)
  // console.log('node', node)
  // if (!node || node._type === 'block') {
  //   const value = blocksToEditorValue([node], type)
  //   const block = SlateBlock.fromJSON(value.document.nodes[0])
  //   console.log('value', value)
  //   console.log(lastKey, value.document.nodes[0])
  //   if (node) {
  //     console.log(block)
  //     change.replaceNodeByKey(lastKey, block)
  //   } else {
  //     change.insertBlock(block)
  //   }
    return change
  // }
}

export default function patchesToChange(
      patches: Patch[],
      editorValue: SlateValue,
      blocks: Block[],
      type: Type
    ) {
  const change = editorValue.change()
  patches.forEach((patch: Patch) => {
    console.log('Incoming patch', patch)
    switch (patch.type) {
      case 'diffMatchPatch':
        return diffMatchPatch(patch, change, blocks)
      case 'set':
        return setPatch(patch, change, blocks, type)
      case 'insert':
        return insertPatch(patch, change, blocks, type)
      default:
        return null
    }
  })
  return change
}
