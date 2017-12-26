const {Rule} = require('../src')

describe('child rules', () => {
  test('all() rules - single failure', () => {
    const rule = Rule.string().all([
      Rule.string()
        .regex(/^[A-Z]/)
        .error('Must start with an uppercase character'),
      Rule.string()
        .regex(/[a-z]+/)
        .error('Must follow with lowercase characters')
    ])

    expect(rule.validate('Sanity')).toMatchSnapshot('all() rules - match')
    expect(rule.validate('moop')).toMatchSnapshot('all() rules - single failure, custom message')
  })

  test('all() rules - multiple failures', () => {
    const rule = Rule.string().all([
      Rule.string()
        .regex(/^[A-Z]/)
        .error('Must start with an uppercase character'),
      Rule.string()
        .min(5)
        .error('5 chars or more'),
      Rule.string()
        .regex(/[a-z]+/)
        .error('Must follow with lowercase characters')
    ])

    expect(rule.validate('Sanity')).toMatchSnapshot('all() rules - match')
    expect(rule.validate('moop')).toMatchSnapshot(
      'all() rules - multiple failures, custom messages'
    )
  })

  test('all() rules - single failure, custom, common error', () => {
    const rule = Rule.string()
      .all([Rule.string().regex(/^[A-Z]/), Rule.string().regex(/[a-z]+/)])
      .error('Needs to start with a capital letter and then follow with lowercase characters')

    expect(rule.validate('moop')).toMatchSnapshot('all() rules - single failure, common error')
  })

  test('all() rules - single failure, custom, common error', () => {
    const rule = Rule.string()
      .all([Rule.string().regex(/^[A-Z]/), Rule.string().min(5), Rule.string().regex(/[a-z]+/)])
      .error('Needs to be a capital letter followed by at least 4 lowercase characters')

    expect(rule.validate('moop')).toMatchSnapshot('all() rules - multiple failures, common error')
  })
})
