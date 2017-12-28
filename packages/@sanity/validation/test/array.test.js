const {Rule} = require('../src')

describe('array', () => {
  test('required constraint', () => {
    const rule = Rule.array().required()
    expect(rule.validate(null)).toMatchSnapshot('required: null')
    expect(rule.validate(undefined)).toMatchSnapshot('required: undefined')
    expect(rule.validate([])).toMatchSnapshot('required: empty array')
    expect(rule.validate(['hei'])).toMatchSnapshot('required: valid')
  })

  test('min length constraint', () => {
    const rule = Rule.array().min(2)
    expect(rule.validate(['a'])).toMatchSnapshot('min length: too short')
    expect(rule.validate(['a', 'b', 'c'])).toMatchSnapshot('min length: valid')
  })

  test('max length constraint', () => {
    const rule = Rule.array().max(2)
    expect(rule.validate(['a', 'b', 'c', 'd'])).toMatchSnapshot('max length: too long')
    expect(rule.validate(['a'])).toMatchSnapshot('max length: valid')
  })

  test('exact length constraint', () => {
    const rule = Rule.array().length(2)
    expect(rule.validate(['a', 'b', 'c'])).toMatchSnapshot('exact length: too long')
    expect(rule.validate(['a'])).toMatchSnapshot('exact length: too short')
    expect(rule.validate(['a', 'b'])).toMatchSnapshot('exact length: valid')
  })

  test('unique constraint (default, simple values)', () => {
    const rule = Rule.array().unique()
    expect(rule.validate(['a', 'b', 'c', 'd'])).toMatchSnapshot('simple unique: valid')
    expect(rule.validate(['a', 'b', 'c', 'a'])).toMatchSnapshot('simple unique: duplicates')
  })

  test('unique constraint (default, object values)', () => {
    const rule = Rule.array().unique()
    const ref = id => ({_ref: id, _type: 'reference'})
    expect(rule.validate(['a', 'b', 'c', 'd'].map(ref))).toMatchSnapshot('object unique: valid')
    expect(rule.validate(['a', 'b', 'c', 'a'].map(ref))).toMatchSnapshot(
      'object unique: duplicates'
    )
  })

  test('unique constraint (default, array values)', () => {
    const rule = Rule.array().unique()
    const refArr = id => [{_ref: id, _type: 'reference'}]
    expect(rule.validate(['a', 'b', 'c', 'd'].map(refArr))).toMatchSnapshot('array unique: valid')
    expect(rule.validate(['a', 'a', 'c', 'd'].map(refArr))).toMatchSnapshot(
      'array unique: duplicates'
    )
  })

  test('unique constraint (default, bool values)', () => {
    const rule = Rule.array().unique()
    expect(rule.validate([true, false])).toMatchSnapshot('boolean unique: valid')
    expect(rule.validate([false, true, false])).toMatchSnapshot('boolean unique: duplicates')
  })

  test('unique constraint (default, numeric values)', () => {
    const rule = Rule.array().unique()
    expect(rule.validate([1, 3])).toMatchSnapshot('numeric unique: valid')
    expect(rule.validate([3, 1, 3])).toMatchSnapshot('numeric unique: duplicates')
  })
})
