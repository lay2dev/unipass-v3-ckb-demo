module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'node/no-callback-literal': 'off',
    'import/no-unresolved': 'off',
    'no-callback-literal': 0,
    'max-len': 0,
    'no-console': 'off',
    'no-new': 'off',
    semi: 'off',
  },
  globals: {
    Sea: 'readonly',
    VConsole: 'readonly',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {},
    },
  ],
}
