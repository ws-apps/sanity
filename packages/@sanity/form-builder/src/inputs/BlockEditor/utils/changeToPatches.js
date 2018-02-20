// @flow
import type {Block, SlateChange, SlateOperation, Type} from '../typeDefs'
import {Document, Operations} from 'slate'
import {flatten} from 'lodash'
import {editorValueToBlocks} from '@sanity/block-tools'
import {unset, set, insert, setIfMissing} from '../../../PatchEvent'
import randomKey from './randomKey'

// function insertTextPatch(operation: Operation, blocks: Block[]) {
//   const {text, offset, value} = operation
//   const block = blocks[operation.path[0]]
//   const span = block.children ? block.children[operation.path[1]] : null
//   if (!span) {
//     throw new Error('Could not find span')
//   }
//   let nextText = value.focusText.text
//   nextText = [nextText.slice(0, offset), text, nextText.slice(offset)].join('')
//   return set(nextText, [{_key: block._key}, 'children', {_key: span._key}, 'text'])
// }

// function removeTextPatch(operation: SlateOperation, blocks: Block[]) {
//   const {text, offset, value} = operation
//   const block = blocks[operation.path[0]]
//   const span = block.children ? block.children[operation.path[1]] : null
//   if (!span) {
//     throw new Error('Could not find span')
//   }
//   let nextText = value.focusText.text
//   nextText = [nextText.slice(0, offset), nextText.slice(offset + text.length)].join('')
//   return set(nextText, [{_key: block._key}, 'children', {_key: span._key}, 'text'])
// }

function removeNodePatch(operation: SlateOperation, blocks: Block[]) {
  if (operation.path.length === 1) {
    const block = blocks[operation.path[0]]
    return unset([{_key: block._key}])
  }
  console.log(operation)
  throw new Error("Don't know how to unset that")
}

function setBlockPatch(operation: SlateOperation, blocks: Block[], blockContentType) {
  const {value} = operation
  const block = blocks ? blocks[operation.path[0]] : null
  const fragment = editorValueToBlocks(
    Operations.apply(value, operation).toJSON(),
    blockContentType
  )
  // This block just got deleted by slate (propbaby a remove_text)
  if (!fragment && block) {
    return unset([{_key: block._key}])
  }
  const newBlock = fragment[operation.path[0]]
  // Retain the keys on the newBlock
  newBlock._key = block ? block._key : randomKey(12)
  newBlock.children.forEach((child, index) => {
    child._key = `${newBlock._key}${index}`
  })
  // Empty document, set block as only child
  if (!blocks || !blocks.length) {
    return set([newBlock])
  }
  // Block doesn't exist, so insert it
  if (!blocks.find(blk => blk._key === block._key)) {
    return insert(newBlock, 'after', blocks.length)
  }
  // Set the block with new values
  return set(newBlock, [{_key: block._key}])
}

function splitNodePatch(operation: SlateOperation, blocks: Block[], blockContentType, change) {
  console.log(operation)
  const {value} = operation
  const patches = []
  const appliedValue = Operations.apply(value, operation).toJSON()
  const fragment = editorValueToBlocks(
    appliedValue,
    blockContentType
  )
  // console.log('fragment', fragment)
  const block = blocks ? blocks[operation.path[0]] : null
  // if (operation.path.length !== 1) {
  //   patches.push(set(block, [{_key: block._key}]))
  // }
  if (operation.path.length === 1) {
    const oldBlock = fragment[operation.path[0]]
    patches.push(set(oldBlock, [{_key: oldBlock._key}]))
    const newBlock = fragment[operation.path[0]+1]
    // Set new keys on the newBlock
    newBlock._key = randomKey(12)
    newBlock.children.forEach((child, index) => {
      child._key = `${newBlock._key}${index}`
    })
    patches.push(insert([newBlock], 'after', [{_key: block._key}]))
  }
  console.log('patches', patches)
  return patches
}

export default function changeToPatches(change: SlateChange, blocks: Block[], blockContentType: Type) {
  const {operations} = change
  const patches = flatten(operations.map((operation: SlateOperation) => {
    console.log(operation.type)
    switch (operation.type) {
      case 'insert_text':
        return setBlockPatch(operation, blocks, blockContentType)
      case 'remove_text':
        return setBlockPatch(operation, blocks, blockContentType)
      case 'add_mark':
        return setBlockPatch(operation, blocks, blockContentType)
      case 'remove_mark':
        return setBlockPatch(operation, blocks, blockContentType)
      case 'set_node':
        return setBlockPatch(operation, blocks, blockContentType)
      case 'remove_node':
        return removeNodePatch(operation, blocks, blockContentType)
      case 'split_node':
        return splitNodePatch(operation, blocks, blockContentType, change)
      default:
        return null
    }
  }).toArray()).filter(Boolean)
  // console.log(patches)
  return patches
}
