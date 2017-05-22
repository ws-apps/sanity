/* eslint-disable id-length, quote-props */
import ChangeSet from '../../src/changes/ChangeSet'

export default [
  {
    name: 'Simple path unset',
    before: {
      a: {
        b: 7,
        c: 10
      }
    },
    patch: {
      unset: ['a.b']
    },
    after: {
      a: {
        c: 10
      }
    },
    changes: (new ChangeSet())
      .unset(['a', 'b'])
  },

  {
    name: 'Simple array unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[2]']
    },
    after: {
      a: [0, 10, 30, 40, 50]
    },
    changes: (new ChangeSet())
      .unset(['a', 2])
  },

  {
    name: 'Range unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[:3]']
    },
    after: {
      a: [30, 40, 50]
    },
    changes: (new ChangeSet())
      .unset(['a', 2])
      .unset(['a', 1])
      .unset(['a', 0])
  },

  {
    name: 'Missing index unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[103]']
    },
    after: {
      a: [0, 10, 20, 30, 40, 50]
    },
    changes: (new ChangeSet())
  },

  {
    name: 'Missing attribute unset',
    before: {
      a: {
        b: 7,
        c: 10
      }
    },
    patch: {
      unset: ['a.d']
    },
    after: {
      a: {
        b: 7,
        c: 10
      }
    },
    changes: (new ChangeSet())
  },

  {
    name: 'Union unset',
    before: {
      a: {
        b: 7,
        c: 10
      }
    },
    patch: {
      unset: ['a[b,c]']
    },
    after: {
      a: {}
    },
    changes: (new ChangeSet())
      .unset(['a', 'b'])
      .unset(['a', 'c'])
  },

  {
    name: 'Negative index unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[-1]']
    },
    after: {
      a: [0, 10, 20, 30, 40]
    },
    changes: (new ChangeSet())
      .unset(['a', 5])
  },

  {
    name: 'Negative index range unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[-3:-1]']
    },
    after: {
      a: [0, 10, 20, 50]
    },
    changes: (new ChangeSet())
      .unset(['a', 4])
      .unset(['a', 3])
  },

  {
    name: 'By key',
    before: {
      a: [{key: 'one'}, {key: 'two'}],
    },
    patch: {
      unset: ['a[key=="one"]']
    },
    after: {
      a: [{key: 'two'}],
    },
    changes: (new ChangeSet())
      .unset(['a', 0])
  }

]
