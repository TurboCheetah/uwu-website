import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  globals: {
    process: 'readonly',
  },
  ignores: [
    '.github/workflows/*.yml',
  ],
})
