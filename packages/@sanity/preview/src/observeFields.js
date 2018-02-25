// @flow
import client from 'part:@sanity/base/client'
import Observable from '@sanity/observable'
import debounceCollect from './utils/debounceCollect'
import {combineSelections, reassemble, toGradientQuery} from './utils/optimizeQuery'
import {flatten, difference} from 'lodash'
import type {FieldName, Id} from './types'
import applyMutations from './utils/applyMutation'

let _globalListener
const getGlobalListener = () => {
  if (!_globalListener) {
    _globalListener = Observable.from(
      client.listen('*[!(_id in path("_.**"))]', {}, {includeResult: false})
    ).share()
  }
  return _globalListener
}

function listen(id: Id) {
  return getGlobalListener().filter(event => event.documentId === id)
}

function fetchAllDocumentPaths(selections: Selection[]) {
  const combinedSelections = combineSelections(selections)
  return client.observable
    .fetch(toGradientQuery(combinedSelections))
    .map(result => reassemble(result, combinedSelections))
}

const fetchDocumentPathsFast = debounceCollect(fetchAllDocumentPaths, 100)
const fetchDocumentPathsSlow = debounceCollect(fetchAllDocumentPaths, 1000)

// keep for debugging purposes for now
// function fetchDocumentPaths(id, selection) {
//   return client.observable.fetch(`*[_id==$id]{_id,_type,${selection.join(',')}}`, {id})
//     .map(result => result[0])
// }

type CachedFieldObserver = {
  id: Id,
  fields: FieldName[],
  changes$: Observable
}

type Cache = {[id: Id]: CachedFieldObserver[]}
const CACHE: Cache = {} // todo: use a LRU cache instead (e.g. hashlru or quick-lru)

function createCachedFieldObserver(id, fields): CachedFieldObserver {
  let cachedLatest = null
  const changes$ = new Observable(observer => {
    observer.next(cachedLatest)
    observer.complete()
  })
    .mergeMap(latest => {
      const snapshotEvents = latest // Re-emit last known value immediately
        ? Observable.of(latest)
            .concat(fetchDocumentPathsSlow(id, fields))
            .map(snapshot => ({type: 'snapshot', snapshot: snapshot}))
        : fetchDocumentPathsFast(id, fields).mergeMap(
            result =>
              result === undefined
                ? // hack: if we get undefined as result here it is most likely because the document has
                  // just been created and is not yet indexed. We therefore need to wait a bit and then re-fetch.
                  fetchDocumentPathsSlow(id, fields)
                : Observable.of(result)
          )
      return snapshotEvents
        .map(snapshot => ({type: 'snapshot', snapshot: snapshot}))
        .concat(listen(id))
    })
    .scan((prevSnapshot, event) => {
      if (event.type === 'snapshot') {
        return event.snapshot
      }
      if (event.type === 'mutation') {
        return applyMutations(prevSnapshot, event.mutations)
      }
      // eslint-disable-next-line no-console
      console.warn(new Error(`Invalid event: ${event.type}`))
      return null
    }, null)
    .filter(Boolean)
    .do(v => (cachedLatest = v))
    .publishReplay()
    .refCount()
  return {id, fields, changes$}
}

export default function cachedObserveFields(id: Id, fields: FieldName[]) {
  if (!(id in CACHE)) {
    CACHE[id] = []
  }

  const existingObservers = CACHE[id]
  const missingFields = difference(
    fields,
    flatten(existingObservers.map(cachedFieldObserver => cachedFieldObserver.fields))
  )

  if (missingFields.length > 0) {
    existingObservers.push(createCachedFieldObserver(id, fields))
  }

  const cachedFieldObservers = existingObservers
    .filter(observer => observer.fields.some(fieldName => fields.includes(fieldName)))
    .map(cached => cached.changes$)

  return Observable.combineLatest(cachedFieldObservers)
    .map(snapshots => Object.assign({}, ...snapshots))
    .distinctUntilChanged((prev, current) => fields.every(field => prev[field] === current[field]))
}
