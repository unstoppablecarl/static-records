import { describe, expect, test } from 'vitest'
import { TESTS as useExampleTests } from '../readme/code/use-example'
import { TESTS as contactsTests } from '../readme/code/contacts'
import { TESTS as usingClasses } from '../readme/code/using-classes'
import { TESTS as defaultValues } from '../readme/code/default-values'

import type { TestCase } from '../readme/types'

describe('readme tests', async () => {
  describe('use-example.ts', async () => {
    runTests(useExampleTests)
  })
  describe('contacts.ts', async () => {
    runTests(contactsTests)
  })
  describe('using-classes.ts', async () => {
    runTests(usingClasses)
  })
  describe('default-values.ts', async () => {
    runTests(defaultValues)
  })
})

function runTests(tests: TestCase[]) {
  test.each(tests)(
    'expected: $expected, actual: $actual',
    ({ expected, actual, exact },
    ) => {
      exact = exact ?? true
      if (exact && expected !== actual) {
        expect(actual).toBe(expected)
      } else {
        expect(actual).toEqual(expected)
      }
    })
}