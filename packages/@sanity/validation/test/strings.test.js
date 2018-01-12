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

  test('exact length constraint', () => {
    const rule = Rule.string().length(5)
    expect(rule.validate('abcdefgh')).toMatchSnapshot('exact length: too long')
    expect(rule.validate('abc')).toMatchSnapshot('exact length: too short')
    expect(rule.validate('abcde')).toMatchSnapshot('exact length: valid')
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

  test('regex constraint', () => {
    const rule = Rule.string().regex(/^[A-Z][a-z]+$/)
    expect(rule.validate('SANITY')).toMatchSnapshot('regex: non-match')
    expect(rule.validate('Sanity')).toMatchSnapshot('regex: match')
  })

  test('regex constraint (inverted)', () => {
    const rule = Rule.string().regex(/^[A-Z][a-z]+$/, {invert: true})
    expect(rule.validate('SANITY')).toMatchSnapshot('regex: inverted non-match')
    expect(rule.validate('Sanity')).toMatchSnapshot('regex: inverted match')
  })

  test('regex constraint (custom pattern name)', () => {
    const rule = Rule.string().regex(/^[A-Z][a-z]+$/, 'PascalCase')
    expect(rule.validate('SANITY')).toMatchSnapshot('regex: non-match w/ custom pattern name')
    expect(rule.validate('Sanity')).toMatchSnapshot('regex: match w/ custom pattern name')
  })

  test('regex constraint (custom pattern name, as options)', () => {
    const rule = Rule.string().regex(/^[A-Z][a-z]+$/, {name: 'PascalCase'})
    expect(rule.validate('SANITY')).toMatchSnapshot('regex: non-match w/ custom pattern name (opt)')
    expect(rule.validate('Sanity')).toMatchSnapshot('regex: match w/ custom pattern name (opt)')
  })

  test('url constraint', () => {
    const rule = Rule.string().url()
    expect(rule.validate('SANITY')).toMatchSnapshot('url: non-match')
    expect(rule.validate('https://sanity.io/')).toMatchSnapshot('url: match')
  })

  test('url constraint (invalid protocol)', () => {
    const rule = Rule.string().url({schemes: ['http', 'ftp']})
    expect(rule.validate('https://sanity.io/')).toMatchSnapshot('url: protocol non-match')
    expect(rule.validate('ftp://code.sanity.io/')).toMatchSnapshot('url: protocol match')
  })

  test('url constraint (credentials)', () => {
    let rule = Rule.string().url({allowCredentials: true})
    expect(rule.validate('http://foo:bar@sanity.io/')).toMatchSnapshot(
      'url: credentials specified and allowed'
    )
    expect(rule.validate('http://sanity.io/')).toMatchSnapshot(
      'url: credentials not specified but allowed'
    )

    rule = Rule.string().url({allowCredentials: false})
    expect(rule.validate('http://foo:bar@sanity.io/')).toMatchSnapshot(
      'url: credentials specified but not allowed'
    )
    expect(rule.validate('http://sanity.io/')).toMatchSnapshot(
      'url: credentials not specified and not allowed'
    )
    expect(rule.validate('http://espen@sanity.io/')).toMatchSnapshot(
      'url: username specified but not allowed'
    )
  })
})
