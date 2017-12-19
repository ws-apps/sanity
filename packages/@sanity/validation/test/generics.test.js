const {Rule} = require('../src')
const ArrayRule = require('../src/ArrayRule')

describe('generics', () => {
  test('should be able to construct an empty rule', () => {
    expect(() => new Rule()).not.toThrow(Error)
    expect(new Rule()).toBeInstanceOf(Rule)
  })

  test('should be able to construct a new typed rule', () => {
    expect(Rule.array()).toBeInstanceOf(ArrayRule)
  })

  test('clones rule when changing generics', () => {
    const baseRule = new Rule()
    const typed = baseRule.type('string')
    expect(baseRule).not.toBe(typed)
  })

  test('clones rule when changing type-specific rules', () => {
    const baseRule = Rule.string()
    const specific = baseRule.min(5)
    expect(baseRule).not.toBe(specific)
  })

  test('throws validation error on non-matching types', () => {
    expect(() => Rule.string().validate(123)).toThrowErrorMatchingSnapshot()
  })
})
