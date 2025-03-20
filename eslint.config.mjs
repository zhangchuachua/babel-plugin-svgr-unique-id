import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  rules: {
    'no-template-curly-in-string': 'warn',
  },
})
