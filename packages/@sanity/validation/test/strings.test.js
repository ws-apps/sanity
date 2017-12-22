const {Rule} = require('../src')

describe('string', () => {
  test('required constraint', () => {
    const rule = Rule.string().required()
    expect(rule.validate('')).toMatchSnapshot('required: empty string')
    expect(rule.validate(null)).toMatchSnapshot('required: null')
    expect(rule.validate(undefined)).toMatchSnapshot('required: undefined')
    expect(rule.validate('abc')).toMatchSnapshot('required: valid')
  })

  test('min length constraint', () => {
    const rule = Rule.string().min(2)
    expect(rule.validate('a')).toMatchSnapshot('min length: too short')
    expect(rule.validate('abc')).toMatchSnapshot('min length: valid')
  })

  test('max length constraint', () => {
    const rule = Rule.string().max(5)
    expect(rule.validate('abcdefg')).toMatchSnapshot('max length: too long')
    expect(rule.validate('abc')).toMatchSnapshot('max length: valid')
  })

  test('uppercase constraint', () => {
    const rule = Rule.string().uppercase()
    expect(rule.validate('sanity')).toMatchSnapshot('uppercase: all lowercase')
    expect(rule.validate('Sanity')).toMatchSnapshot('uppercase: some lowercase')
    expect(rule.validate('Sanity')).toMatchSnapshot('uppercase: some lowercase')
    expect(rule.validate('SäNITY')).toMatchSnapshot('uppercase: locale characters')
    expect(rule.validate('SANITY')).toMatchSnapshot('uppercase: valid')
  })

  test('lowercase constraint', () => {
    const rule = Rule.string().lowercase()
    expect(rule.validate('SANITY')).toMatchSnapshot('lowercase: all uppercase')
    expect(rule.validate('Sanity')).toMatchSnapshot('lowercase: some uppercase')
    expect(rule.validate('sÄnity')).toMatchSnapshot('lowercase: locale characters')
    expect(rule.validate('sanity')).toMatchSnapshot('lowercase: valid')
  })
})
