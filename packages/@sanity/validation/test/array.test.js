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

  test.skip('unique constraint (default, simple values)', () => {
    const rule = Rule.array().unique()
    expect(rule.validate(['a', 'b'])).toMatchSnapshot('unique: valid')
    expect(rule.validate(['a', 'a'])).toMatchSnapshot('unique: duplicates')
  })
})
