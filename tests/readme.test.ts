import { describe, expect, test } from 'vitest'
import { TESTS as useExampleTests } from '../readme/code/use-example'
import { TESTS as contactsTests } from '../readme/code/contacts'
import { TESTS as usingClassesTests } from '../readme/code/using-classes'
import { TESTS as defaultValues } from '../readme/code/default-values'
import { TESTS as factoryContactTests } from '../readme/code/static-records-factory-contacts'
import { TESTS as factoryTests } from '../readme/code/static-records-factory'
import { TESTS as factoryAdvancedTests } from '../readme/code/static-records-factory-advanced'
import { TESTS as lazyProps } from '../readme/code/lazy-props'
import { TESTS as lazyTree } from '../readme/code/lazy-tree'
import { TESTS as resolverArgs } from '../readme/code/resolver-args'

import type { TestCase } from '../readme/types'

describe('readme tests', async () => {
  describe('use-example.ts', async () => {
    runTests(useExampleTests)
  })
  describe('contacts.ts', async () => {
    runTests(contactsTests)
  })
  describe('using-classes.ts', async () => {
    runTests(usingClassesTests)
  })
  describe('default-values.ts', async () => {
    runTests(defaultValues)
  })
  describe('static-records-factory-contacts.ts', async () => {
    runTests(factoryContactTests)
  })
  describe('static-records-factory.ts', async () => {
    runTests(factoryTests)
  })
  describe('static-records-factory-advanced.ts', async () => {
    runTests(factoryAdvancedTests)
  })
  describe('lazy-props.ts', async () => {
    runTests(lazyProps)
  })
  describe('lazy-tree.ts', async () => {
    runTests(lazyTree)
  })
  describe('resolver-args.ts', async () => {
    runTests(resolverArgs)
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