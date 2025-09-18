import { type DefaultProtoItem, staticRecords } from '../../src'
import type { TestCase } from '../types'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly slug: string,
}

const PEOPLE = staticRecords<Person>('Person')

const DAN = PEOPLE.define(
  'DAN',
  // the protoItem arg has the id and recordType symbol keys
  // the record type is passed in the second for convenience
  (protoItem: DefaultProtoItem, recordType: string) => ({
    name: 'Dan',
    slug: protoItem.id + '-' + recordType,
  }),
)
PEOPLE.lock()

export const TESTS: TestCase[] = [
  {
    key: 'DAN.id',
    actual: DAN.id,
    expected: 'DAN',
  },
  {
    key: 'DAN.name',
    actual: DAN.name,
    expected: 'Dan',
  },
  {
    key: 'DAN.slug',
    actual: DAN.slug,
    expected: 'DAN-Person',
  },
]