import {test} from 'tap'
import SlateValueContainer from '../../src/inputs/BlockEditor-slate/SlateValueContainer'
import {Patcher, ImmutableAccessor} from '@sanity/mutator'

import simpleDoc from './fixtures/simpleDoc.json'


// Given the nodes array from a paragraph, extracts all the content strings into an array
function extractStringsFromNodes(nodes) {
  const length = nodes.length()
  const result = []
  for (let i = 0; i < length; i++) {
    result.push(nodes.getIndex(i).getAttribute('content').get())
  }
  return result
}

// The patcher only knows how to patch documents, this is a mock accessor that pretends that a
// SlateValueContainer is on the "content" attribute in a document with the id "fakeId"
function wrapSlateValueInFakeDocument(slateValueContainer) {
  return {
    containerType() {
      return 'object'
    },
    hasAttribute(key) {
      return key == '_id' || key == 'content'
    },
    getAttribute(key) {
      if (key == '_id') {
        return new ImmutableAccessor('fakeId')
      }
      if (key == 'content') {
        return slateValueContainer
      }
      return null
    },
    setAttributeAccessor(key, accessor) {
      if (key != 'content') {
        throw new Error(`Unable to set key ${key} in this mock document container`)
      }
      return wrapSlateValueInFakeDocument(accessor)
    }
  }
}

// Patches a slate value by momentarily wrapping it in a fake document container
function applyPatch(container, patch) {
  patch.id = 'fakeId'
  const patcher = new Patcher(patch)
  const wrapped = patcher.applyViaAccessor(wrapSlateValueInFakeDocument(container))
  return wrapped.getAttribute('content')
}


test('simple editing of spans', t => {
  const container = SlateValueContainer.deserialize(simpleDoc.content, {})

  // Just extract the text from each span and make sure it is correct
  t.same(extractStringsFromNodes(container.getIndex(0).getAttribute('nodes')), ['this is', ' italic ', 'and this is', ' bold'])

  // Change the content of one span without changing the marks
  const mutated = applyPatch(container, {
    set: {
      'content[0].nodes[1].content': ' strong '
    }
  })
  t.same(extractStringsFromNodes(mutated.getIndex(0).getAttribute('nodes')), ['this is', ' strong ', 'and this is', ' bold'])

  // Remove marks on the italic part, make sure the spans around it aren't merged into it
  const reMarked = applyPatch(container, {
    set: {
      'content[0].nodes[1].marks': []
    }
  })
  t.same(extractStringsFromNodes(reMarked.getIndex(0).getAttribute('nodes')), ['this is', ' italic ', 'and this is', ' bold'])

  // Insert a new span and verify that it is joined with the adjacent span
  const inserted = applyPatch(container, {
    insert: {
      after: 'content[_key=="first"].nodes[0]',
      items: [{
        _type: 'textspan',
        content: ' a span formatted as',
        marks: []
      }]
    }
  })
  t.same(extractStringsFromNodes(inserted.getIndex(0).getAttribute('nodes')), ['this is', ' a span formatted as', ' italic ', 'and this is', ' bold'])

  // Clear the contents of a span completely
  const cleared = applyPatch(container, {
    set: {
      'content[0].nodes[1].content': ''
    }
  })
  t.same(extractStringsFromNodes(cleared.getIndex(0).getAttribute('nodes')), ['this is', '', 'and this is', ' bold'],
    'should know that the empty span has not been deleted')


  // Set text on an empty paragraph
  const formerlyEmpty = applyPatch(container, {
    set: {
      'content[_key=="empty"].nodes[0].content': 'Hello!'
    }
  })
  t.same(extractStringsFromNodes(formerlyEmpty.getIndex(1).getAttribute('nodes')), ['Hello!'])

  t.end()
})

test('serialization', t => {
  const container = SlateValueContainer.deserialize(simpleDoc.content, {})
  t.same(container.serialize(), simpleDoc.content)
  t.end()
})

test('generation of clean up patches', t => {
  const container = SlateValueContainer.deserialize(simpleDoc.content, {})
  // Remove marks on the italic part, the cleanup patch should merge it into the adjacent spans
  const reMarked = applyPatch(container, {
    set: {
      'content[0].nodes[1].marks': []
    }
  })
  t.same(reMarked.getIndex(0).getAttribute('nodes').generateCleanUpPatch(),[{
    type: 'insert',
    position: 'replace',
    path: ['[0:2]'],
    value: [{
      _type: 'textspan',
      content: 'this is italic and this is'
    }]
  }])

  // Remove the contents of the node, the adjacent spans have same marks so should be merged around it
  const blanked = applyPatch(container, {
    set: {
      'content[0].nodes[1].content': ''
    }
  })
  t.same(blanked.getIndex(0).getAttribute('nodes').generateCleanUpPatch(),[
    {
      type: 'unset',
      path: ['[1]']
    },
    {
      type: 'insert',
      path: ['[0:1]'],
      position: 'replace',
      value: [{
        _type: 'textspan',
        content: 'this isand this is'
      }]
    }
  ])
  t.end()
})
