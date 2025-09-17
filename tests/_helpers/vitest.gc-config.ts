import { defineConfig } from 'vitest/config'

import baseConfig from '../../vitest.config'

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['tests/**/*.gc-test.ts'],
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.json',
      include: [
        'tests/**/*.gc-test.ts',
      ],
    },
    testTimeout: 30000,
    // Run memory tests serially to avoid interference
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: ['--expose-gc'],
        singleFork: true,
      },
    },
  },
})
