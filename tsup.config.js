import { defineConfig } from 'tsup'
export default defineConfig([
  {
    dts: true,
    sourcemap: true,
    clean: true,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    define: {
      __DEV__: `process.env.NODE_ENV !== 'production'`,
    },
  },
])