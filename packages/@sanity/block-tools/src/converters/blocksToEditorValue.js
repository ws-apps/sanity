// @flow

import randomKey from '../util/randomKey'
import resolveJsType from '../util/resolveJsType'
import blockContentTypeToOptions from '../util/blockContentTypeToOptions'

import {SLATE_DEFAULT_BLOCK} from '../constants'

function resolveTypeName(value) {
  const jsType = resolveJsType(value)
  return ((jsType === 'object' && '_type' in value) && value._type) || jsType
}

function hasKeys(obj) {
  for (const key in obj) { // eslint-disable-line guard-for-in
    return true
  }
  return false
}

function toRawMark(markName) {
  return {
    kind: 'mark',
    type: markName
  }
}

function sanitySpanToRawSlateBlockNode(span, sanityBlock, blockContentFeatures) {

  if (!span._key) {
    span._key = randomKey(12)
  }

  if (span._type !== 'span') {
    return {
      kind: 'inline',
      isVoid: true,
      type: span._type,
      key: span._key,
      data: {value: span},
      nodes: []
    }
  }

  const {text, marks = []} = span
  const decorators = marks.filter(mark => {
    return !sanityBlock.markDefs.map(def => def._key).includes(mark)
  })
  const annotationKeys = marks.filter(x => decorators.indexOf(x) == -1)
  let annotations
  if (annotationKeys.length) {
    annotations = {}
    annotationKeys.forEach(key => {
      const annotation = sanityBlock.markDefs.find(def => def._key === key)
      if (annotations && annotation) {
        annotations[annotation._type] = annotation
      }
    })
  }

  const leaf = {
    kind: 'leaf',
    text: text,
    marks: decorators.filter(Boolean).map(toRawMark)
  }

  if (!annotations) {
    return {kind: 'text', key: span._key, leaves: [leaf]}
  }

  return {
    kind: 'inline',
    isVoid: false,
    key: span._key,
    type: 'span',
    data: {annotations},
    nodes: [{kind: 'text', leaves: [leaf]}]
  }
}

// Block type object
function sanityBlockToRawNode(sanityBlock, type, blockContentFeatures) {
  const {children, _type, markDefs, ...rest} = sanityBlock
  let restData = {}
  if (hasKeys(rest)) {
    restData = {data: {_type, ...rest}}
    // Check if we should allow listItem if present
    const {listItem} = restData.data
    if (listItem
      && !blockContentFeatures.lists
        .find(list => list.value === listItem)
    ) {
      delete restData.data.listItem
    }
    // Check if we should allow style if present
    const {style} = restData.data
    if (style
      && !blockContentFeatures.styles
        .find(_style => _style.value === style)
    ) {
      restData.data.style = 'normal'
    }
  }

  if (!sanityBlock._key) {
    sanityBlock._key = randomKey(12)
  }

  // Enforce the data to have the same key
  restData.data._key = sanityBlock._key

  return {
    kind: 'block',
    key: sanityBlock._key,
    isVoid: false,
    type: 'contentBlock',
    ...restData,
    nodes: children
      .map(child => sanitySpanToRawSlateBlockNode(
        child,
        sanityBlock, blockContentFeatures
      ))
  }
}

// Embedded object
function sanityBlockItemToRaw(blockItem, type) {
  if (!blockItem._key) {
    blockItem._key = randomKey(12)
  }
  return {
    kind: 'block',
    key: blockItem._key,
    type: type ? type.name : '__unknown',
    isVoid: true,
    data: {value: blockItem},
    nodes: []
  }
}

function sanityBlockItemToRawNode(blockItem, type, blockContentFeatures) {
  const blockItemType = resolveTypeName(blockItem)

  const memberType = type.of.find(ofType => ofType.name === blockItemType)

  return blockItemType === 'block'
    ? sanityBlockToRawNode(blockItem, memberType, blockContentFeatures)
    : sanityBlockItemToRaw(blockItem, memberType)
}

function sanityBlocksArrayToRawNodes(blockArray, type, blockContentFeatures) {
  return blockArray
    .filter(Boolean) // this is a temporary guard against null values, @todo: remove
    .map(item => sanityBlockItemToRawNode(item, type, blockContentFeatures))
}

export default function blocksToSlateState(array: [], type: any) {
  const defaultNodes = [{...SLATE_DEFAULT_BLOCK, nodes: [{kind: 'text', text: ''}]}]
  const blockContentFeatures = blockContentTypeToOptions(type)
  return {
    kind: 'state',
    document: {
      kind: 'document',
      data: {},
      nodes: (array && array.length > 0)
        ? sanityBlocksArrayToRawNodes(array, type, blockContentFeatures)
        : defaultNodes
    }
  }
}
