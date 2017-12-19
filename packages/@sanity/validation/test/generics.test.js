const {Rule} = require('../src')

describe('generics', () => {
  test('should be able to construct an empty rule', () => {
    expect(() => new Rule()).not.toThrow(Error)
    expect(new Rule()).toBeInstanceOf(Rule)
  })

  test('should be able to construct a new typed rule', () => {
    expect(Rule.string()).toBeInstanceOf(Rule)
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

  test('returns arrays of errors/warnings by default', () => {
    expect(Rule.string().validate(123)).toMatchSnapshot()
  })

  test('throws validation errors if told to', () => {
    expect(() => Rule.string().validate(123, {throwOnError: true})).toThrowErrorMatchingSnapshot()
  })

  test('can override earlier defined rules', () => {
    expect(
      Rule.string()
        .max(1)
        .max(2)
        .validate('hei')
    ).toMatchSnapshot()
  })

  test('can demote errors to warnings', () => {
    const result = Rule.string()
      .warning()
      .validate(123)

    expect(result).toMatchSnapshot()
  })

  test('can customize error messages', () => {
    const result = Rule.string()
      .error('Dude it needs to be a string')
      .validate(123)

    expect(result).toMatchSnapshot()
  })

  test('can customize warning messages', () => {
    const result = Rule.string()
      .warning('Dude it should probably be a string')
      .validate(123)

    expect(result).toMatchSnapshot()
  })

  test('can merge rules', () => {
    const rule = new Rule().required()
    const stringRule = Rule.string().min(5)
    const newRule = rule.merge(stringRule)

    expect(rule).not.toBe(stringRule)
    expect(newRule).not.toBe(stringRule)
    expect(rule).not.toBe(newRule)

    const result = newRule.validate('Hei')
    expect(result).toMatchSnapshot()
  })
})
