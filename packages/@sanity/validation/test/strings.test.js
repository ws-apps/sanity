const {Rule} = require('../src')

describe('string', () => {
  test('returns no warnings/errors on valid string', () => {
    const result = Rule.string()
      .min(0)
      .max(5)
      .validate('hei')

    expect(result).toMatchSnapshot()
  })

  test('returns errors on min length constraint', () => {
    const result = Rule.string()
      .min(1)
      .validate('')

    expect(result).toMatchSnapshot()
  })

  test('returns errors on max length constraint', () => {
    const result = Rule.string()
      .max(5)
      .validate('heisann')

    expect(result).toMatchSnapshot()
  })
})
