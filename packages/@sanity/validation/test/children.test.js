const {Rule} = require('../src')

describe('child rules', () => {
  test('all() rules', () => {
    const rule = Rule.string().all([
      Rule.string().regex(/^[A-Z]/).error('Must start with an uppercase character'),
      Rule.string().regex(/[a-z]+/).error('Must follow with lowercase characters')
    ])

    expect(rule.validate('moop')).toMatchSnapshot('all() rules - failure')
    expect(rule.validate('Sanity')).toMatchSnapshot('all() rules - match')
  })
})
