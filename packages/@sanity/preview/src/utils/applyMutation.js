// @flow
import {Mutation} from '@sanity/mutator'

export default function applyMutations(doc: Document, mutations: Mutation[]) {
  const mutation = new Mutation({mutations})
  return mutation.apply(doc)
}
