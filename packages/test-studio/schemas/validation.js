export default {
  name: 'validationTest',
  type: 'document',
  title: 'Validation test',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Required field with minimum/maximum length validation',
      validation: Rule =>
        Rule.required()
          .min(5)
          .max(100)
    },
    {
      name: 'myUrlField',
      type: 'url',
      title: 'Plain url',
      description: '@TODO: URL validation (inferred)'
    },
    {
      name: 'myFancyUrlField',
      type: 'url',
      title: 'Fancy URL',
      description: 'URL that only allows mailto: and tel: schemes',
      validation: Rule => Rule.url({})
    },
    {
      name: 'date',
      type: 'datetime',
      title: 'Some date',
      description: '@todo ISO-formatted date, inferred'
    },
    {
      name: 'email',
      type: 'email',
      title: 'Recipient email',
      description: '@todo Email, inferred'
    },
    {
      name: 'lowestTemperature',
      type: 'number',
      title: 'Lowest temperature recorded',
      description: 'Only negative numbers',
      validation: Rule => Rule.negative()
    },
    {
      name: 'highestTemperature',
      type: 'number',
      title: 'Highest temperature recorded',
      description: 'Only positive numbers',
      validation: Rule => Rule.positive().min(Rule.valueOfField('lowestTemperature'))
    },
    {
      name: 'someInteger',
      type: 'number',
      title: 'Some integer',
      description: '@todo Only integers'
    },
    {
      name: 'quotes',
      title: 'Quotes',
      description: 'Unique quotes - minimum of one',
      validation: Rule => Rule.min(1).unique(),
      type: 'array',
      of: [
        {
          type: 'string',
          validation: Rule => Rule.min(2).max(100)
        }
      ]
    },
    {
      name: 'authors',
      title: 'Authors',
      description: 'Unique inline authors',
      validation: Rule => Rule.unique(),
      type: 'array',
      of: [
        {
          type: 'author'
        }
      ]
    },
    {
      name: 'titleCase',
      title: 'Title Case',
      description: 'Regex-based title case, custom error message',
      type: 'string',
      validation: Rule =>
        Rule.min(1)
          .regex(/^(?:[A-Z][^\s]*\s?)+$/)
          .error('Must be in Title Case')
    }
  ]
}
