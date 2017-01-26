import React, {PropTypes} from 'react'
import {Plain, Character, Raw} from 'slate'
import BlockEditor from './BlockEditor'
import SlateValueContainer from './SlateValueContainer'
import Immutable from 'immutable'
import differ from 'immutablediff'
import {flatten} from 'lodash'
import {arrayToJSONMatchPath} from '@sanity/mutator'
import {findSpanIndex, getSpan} from './docUtils'

function getDocument(state) {
  return state.get('document')
}

function serializeTextNode(textNode) {
  const segments = textNode.characters.reduce((acc, char) => {
    const prevSegment = acc[acc.length - 1]
    if (prevSegment && Immutable.is(prevSegment.marks, char.marks)) {
      prevSegment.chars.push(char.text)
    } else {
      acc.push({chars: [char.text], marks: char.marks})
    }
    return acc
  }, [])

  return segments.map(segment => (
    {
      _type: 'blocktext',
      content: segment.chars.join(''),
      marks: segment.marks.map(mark => ({_type: mark.type})).toArray()
    }
  ))
}

function serializeNode(node) {
  switch (node.kind) {
    case 'text': {
      return serializeTextNode(node)
    }
  }
  throw new Error(`Unsupported node kind ${node.kind}`)
}

function serializePara(paragraph) {
  return {
    _type: 'paragraph',
    _key: paragraph.key,
    nodes: flatten(paragraph.nodes.map(serializeNode).toArray()),
  }
}

function setParagraph(paragraph, prevDocument, nextDocument) {
  const prevParagraph = prevDocument.nodes.find(node => node.key === paragraph.key)
  const paragraphIdx = nextDocument.nodes.indexOf(paragraph)
  const serializedPara = serializePara(paragraph)
  return prevParagraph
    ? {
      type: 'set',
      path: [{_key: paragraph.key}],
      value: serializedPara
    }
    : {
      type: 'insert',
      path: [paragraphIdx],
      position: 'before',
      items: [serializedPara]
    }
}

function textPatchFromCharacterDiff(diff, prevDocument, nextDocument) {
  const nextTextNode = nextDocument.getIn(diff.path.slice(0, -2))
  const nextParagraph = nextDocument.getIn(diff.path.slice(0, -4))
  const characterIndex = diff.path.slice().pop()
  const spanIndex = findSpanIndex(characterIndex, nextTextNode)
  const span = getSpan(nextTextNode, spanIndex)
  const textNodeOffset = nextParagraph.nodes.indexOf(nextTextNode) + spanIndex
  return [
    {
      type: 'setIfMissing',
      path: [],
      value: [{_type: 'paragraph', _key: nextParagraph.key, nodes: [{_type: 'blocktext', content: ''}]}]
    },
    {
      type: 'set',
      path: [{_key: nextParagraph.key}, 'nodes', textNodeOffset, 'content'],
      value: span.map(char => char.text).join('')
    }
  ]
}

function preparePatch(diff, prevDocument, nextDocument) {
  switch (diff.op) {
    case 'replace': {
      const {path} = diff
      if (path.indexOf('marks') === path.length - 1) {
        const affectedParagraph = nextDocument.getIn(path.slice(0, -5))
        return setParagraph(affectedParagraph, prevDocument, nextDocument)
      }
      throw new Error('Nope')
    }
    case 'add': {
      const {path, value} = diff
      if (value.kind === 'block') {
        if (value.type === 'paragraph') {
          // find position!
          const list = nextDocument.getIn(path.slice(0, -1))
          const valueIdx = list.indexOf(value)
          const previousSibling = list.get(valueIdx - 1)
          const nextSibling = list.get(valueIdx + 1)
          const refKey = (previousSibling ? previousSibling.key : nextSibling.key)
          return {
            type: 'insert',
            path: [{_key: refKey}],
            position: previousSibling ? 'after' : 'before',
            items: [serializePara(value)]
          }
        }
      }
      if (value.kind === 'character') {
        return textPatchFromCharacterDiff(diff, prevDocument, nextDocument)
      }

      throw new Error(`Unhandled value add: ${JSON.stringify(value)}`)
      // if (value.kind === 'character') {
      //   const textNodePath = path.slice(0, -2)
      //   const textNode = nextDocument.getIn(textNodePath)
      //   return {type: 'insert', path: [{_key: textNode.key}], value: serializePara(textNode)}
      // }
      // return {type: 'insert', path: path, value}
    }
    case 'remove': {
      const value = prevDocument.getIn(diff.path)

      if (value.kind === 'block') {
        if (value.type === 'paragraph') {
          return {
            type: 'unset',
            path: [{_key: value.key}]
          }
        }
      }
      if (value.kind === 'character') {
        return textPatchFromCharacterDiff(diff, prevDocument, nextDocument)
      }
    }
    default: {
      throw new Error(`Don't know how to convert JSONPatch operation ${diff.op} to FormBuilder patch`)
    }
  }
}

function getTextNodeIndex(path) {
  return path.indexOf('characters')
}

function JSONPointerToArray(jsonPointerStr) {
  return jsonPointerStr.split('/').slice(1)
}

function withParsedPath(jsonPatch) {
  return jsonPatch.map(op => {
    const [opName, path, value] = [
      op.get('op'),
      JSONPointerToArray(op.get('path')),
      op.get('value')
    ]
    return {
      op: opName,
      path,
      value
    }
  })
}

function samePath(path, otherPath) {
  return arrayToJSONMatchPath(path) === arrayToJSONMatchPath(otherPath)
}

export default class Syncer extends React.PureComponent {
  static valueContainer = SlateValueContainer
  static propTypes = {
    value: PropTypes.instanceOf(SlateValueContainer),
    onChange: PropTypes.func
  }

  state = {
    slateState: null
  }

  constructor(props, ...rest) {
    super(props, ...rest)
    const empty = Plain.deserialize('')
    this.state = {
      slateState: empty.set('document', props.value.document)
    }
  }

  setDocument(document) {
    this.setState((prevState, props) => {
      const {slateState} = prevState
      const previous = slateState.get('document')
      console.log('Prev document', previous)
      console.log('Next document', document)
      return {slateState: slateState.set('document', document)}
    })
  }

  getDocument() {
    return getDocument(this.state.slateState)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      // setTimeout(() => this.setDocument(nextProps.value.document), 10)
      this.setDocument(nextProps.value.document)
    }
  }

  handleChange = nextSlateState => {
    const {onChange} = this.props
    const prevDocument = getDocument(this.state.slateState)
    const nextDocument = getDocument(nextSlateState)
    const diff = withParsedPath(differ(prevDocument, nextDocument))
    this.setState({slateState: nextSlateState})
    if (diff.isEmpty()) {
      return
    }

    const patches = flatten(diff.toArray().map(change => preparePatch(change, prevDocument, nextDocument)))

    console.log({patches})
    // console.log(JSON.stringify({patches}, null, 2))
    console.log('emit onChange!')
    onChange({patch: patches})
    // .map(patch => preparePatch(patch, nextDocument))
    //
    // debugger
    // console.log(JSON.stringify(patches, null, 2))
  }

  render() {
    const {slateState} = this.state
    return slateState ? <BlockEditor {...this.props} onChange={this.handleChange} value={slateState}/> : null
  }
}
