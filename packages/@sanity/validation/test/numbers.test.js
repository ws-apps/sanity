const {Rule} = require('../src')

describe('number', () => {
  test('required constraint', () => {
    const rule = Rule.number().required()
    expect(rule.validate(undefined)).toMatchSnapshot('required: undefined')
    expect(rule.validate(13)).toMatchSnapshot('required: valid')
  })

  test('min constraint', () => {
    const rule = Rule.number().min(10)
    expect(rule.validate(3)).toMatchSnapshot('min: too low')
    expect(rule.validate(10)).toMatchSnapshot('min: valid, at limit')
    expect(rule.validate(20)).toMatchSnapshot('min: valid')
  })

  test('greater than constraint', () => {
    const rule = Rule.number().greaterThan(10)
    expect(rule.validate(3)).toMatchSnapshot('gt: too low')
    expect(rule.validate(10)).toMatchSnapshot('gt: too low, at limit')
    expect(rule.validate(20)).toMatchSnapshot('gt: valid')
  })

  test('max constraint', () => {
    const rule = Rule.number().max(10)
    expect(rule.validate(20)).toMatchSnapshot('max: too large')
    expect(rule.validate(10)).toMatchSnapshot('max: valid, at limit')
    expect(rule.validate(5)).toMatchSnapshot('max: valid')
  })

  test('less than constraint', () => {
    const rule = Rule.number().lessThan(10)
    expect(rule.validate(20)).toMatchSnapshot('lt: too high')
    expect(rule.validate(10)).toMatchSnapshot('lt: too high, at limit')
    expect(rule.validate(3)).toMatchSnapshot('lt: valid')
  })

  test('integer constraint', () => {
    const rule = Rule.number().integer()
    expect(rule.validate(31.14)).toMatchSnapshot('integer: invalid (float)')
    expect(rule.validate(31)).toMatchSnapshot('integer: valid')
  })

  test('precision constraint', () => {
    const rule = Rule.number().precision(3)
    expect(rule.validate(Math.PI)).toMatchSnapshot('precision: invalid (pi)')
    expect(rule.validate(31.133)).toMatchSnapshot('precision: valid (at limit)')
    expect(rule.validate(31.3)).toMatchSnapshot('precision: valid (below limit)')
  })

  test('positive constraint', () => {
    const rule = Rule.number().positive()
    expect(rule.validate(-31.14)).toMatchSnapshot('positive: invalid')
    expect(rule.validate(0)).toMatchSnapshot('positive: valid (zero)')
    expect(rule.validate(13)).toMatchSnapshot('positive: valid')
  })

  test('negative constraint', () => {
    const rule = Rule.number().negative()
    expect(rule.validate(31.14)).toMatchSnapshot('negative: invalid')
    expect(rule.validate(0)).toMatchSnapshot('negative: invalid (zero)')
    expect(rule.validate(-13)).toMatchSnapshot('negative: valid')
  })
})
