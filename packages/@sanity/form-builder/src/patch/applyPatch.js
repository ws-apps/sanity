// @flow
import {isObject} from 'lodash'
import applyArrayPatch from './array'
import applyObjectPatch from './object'
import applyPrimitivePatch from './primitive'
import type {Patch} from '../utils/patches'

export function applyAll(value: any, patches: Array<Patch>) {
  return patches.reduce(_apply, value)
}

function applyPatch<T>(value, patch: Patch): ?T {
  if (Array.isArray(value)) {
    return applyArrayPatch(value, patch)
  }
  if (isObject(value)) {
    return applyObjectPatch(value, patch)
  }
  return applyPrimitivePatch(value, patch)
}

export default function _apply<T>(value: any, patch: Patch) : ?T {
  return applyPatch(value, patch)
}
