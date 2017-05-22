/* eslint-disable id-length, quote-props */
import ChangeSet from '../../src/changes/ChangeSet'

export default [
  {
    name: 'Inc and dec',
    before: {
      a: [0, 1, 2, 3, 4],
      b: 4,
      c: 5
    },
    patch: {
      inc: {
        'a[2]': 1,
        'b': 2,
      },
      dec: {
        'c': 1
      }
    },
    after: {
      a: [0, 1, 3, 3, 4],
      b: 6,
      c: 4
    },
    changes: (new ChangeSet())
      .set(['a', 2], 3)
      .set(['b'], 6)
      .set(['c'], 4)
  },
]
