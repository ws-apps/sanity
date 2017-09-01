// @flow

import {arrayToJSONMatchPath} from '@sanity/mutator'
import assert from 'assert'
import {flatten} from 'lodash'
import type {Patch} from '../../utils/patches'

type GradientPatch = Object
type Origin = 'local' | 'remote'

type Adapter = {
  fromFormBuilder: (patches: Array<Patch>) => Array<GradientPatch>,
  toFormBuilder: (origin: Origin, patches: Array<GradientPatch>) => Array<Patch>
}

const adapter: Adapter = {
  fromFormBuilder(patches) {
    return patches.map(fromFormBuilder)
  },
  toFormBuilder
}

export default adapter

/**
 *
 * *** WARNING ***
 *
 * This function is *EXPERIMENTAL* and very likely to have bugs. It is not in real use yet, and needs
 * to be revised.
 */

function toFormBuilder(origin: Origin, patches: Array<GradientPatch>): Array<Patch> {
  return flatten(patches.map(patch => {
    return flatten(
      Object.keys(patch)
        .filter(key => key !== 'id')
        .map((type): Array<Patch> => {
          if (type === 'unset') {
            return patch.unset.map(path => {
              return {
                type: 'unset',
                path: path.split('.'),
                origin
              }
            })
          }
          return Object.keys(patch[type]).map(path => {
            const formBuilderPath = path
            switch (type) {
              case 'insert': {
                const position = 'before' in patch.insert ? 'before' : 'after'
                return {
                  type: 'insert',
                  position: position,
                  path: formBuilderPath,
                  items: patch[type][path],
                  origin
                }
              }
              case 'set': {
                return {
                  type: 'set',
                  path: formBuilderPath,
                  value: patch[type][path],
                  origin
                }
              }
              case 'unset':
                return {
                  type: 'unset',
                  path: formBuilderPath,
                  origin
                }
              case 'setIfMissing': {
                return {
                  type: 'setIfMissing',
                  path: formBuilderPath,
                  value: patch[type][path],
                  origin
                }
              }
              default: {
                throw new Error(`Unknown patch type: ${type}`)
              }
            }
          })
        })
    )
  }))
}

function fromFormBuilder(patch: Patch): GradientPatch {
  const matchPath = arrayToJSONMatchPath(patch.path || [])
  if (patch.type === 'insert') {
    const {position, items} = patch
    return {
      insert: {
        [position]: matchPath,
        items: items
      }
    }
  }

  if (patch.type === 'unset') {
    return {
      unset: [matchPath]
    }
  }

  assert(patch.type, `Missing patch type in patch ${JSON.stringify(patch)}`)
  if (matchPath) {
    return {
      [patch.type]: {
        [matchPath]: patch.value
      }
    }
  }
  return {
    [patch.type]: patch.value
  }
}
