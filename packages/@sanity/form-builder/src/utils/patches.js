// @flow
import {clone} from 'lodash'

type KeyedSegment = {
  _key: string
}

export type PathSegment = string | number | KeyedSegment

type Path = Array<PathSegment>

type Origin = 'remote' | 'local'

type SetPatch = {
  type: 'set',
  value: any,
  path: Path,
  origin?: Origin
}

type SetIfMissingPatch = {
  type: 'setIfMissing',
  value: any,
  path: Path,
  origin?: Origin
}

type UnsetPatch = {
  type: 'unset',
  path: Path,
  origin?: Origin
}

type InsertPosition = 'before' | 'after'

type InsertPatch = {
  type: 'insert',
  position: InsertPosition,
  items: any[],
  path: Path,
  origin?: Origin
}

export type Patch = SetPatch | SetIfMissingPatch | UnsetPatch | InsertPatch

export function setIfMissing(value : any, path : Path = []) : SetIfMissingPatch {
  return {
    type: 'setIfMissing',
    path,
    value
  }
}

export function insert(items : any[], position: InsertPosition, path : Path = []) : InsertPatch {
  return {
    type: 'insert',
    path,
    position,
    items
  }
}

export function set(value : any, path : Path = []) : SetPatch {
  return {type: 'set', path, value}
}

export function unset(path : Path = []) : UnsetPatch {
  return {type: 'unset', path}
}

export function setPath(patch: Patch, nextPath: Path) : Patch {
  const result = clone(patch)
  result.path = nextPath
  return result
}

export function prefixPath(patch : Patch, segment : PathSegment) : Patch {
  return setPath(patch, [segment, ...patch.path])
}
