module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:boundaries/recommended',
  ],
  settings: {
    'boundaries/elements': [
      { type: 'packages', pattern: 'packages/*/*' },
      { type: 'modules', pattern: 'apps/server/src/modules/*' },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'allow',
        rules: [
          {
            from: ['modules'],
            allow: ['packages', 'modules'],
          },
        ],
      },
    ],
  },
};
