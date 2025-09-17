import { lazyTree, makeLazyFiller, staticRecords, type DefaultProtoItem, recordTypeKey } from '../../src'
import type { TestCase } from '../types'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly emergencyContact: Person,
  readonly emergencyContactWithId: string,
}

const PEOPLE = staticRecords<Person>('Person', {
  filler: makeLazyFiller(),
})

function makePerson<T>(input: T) {
  return {
    ...input,
    emergencyContactWithId: lazyTree((parent: Person) => parent.emergencyContact.id + ': ' + parent.emergencyContact.name) as string,
  }
}

const DAN = PEOPLE.define(
  'DAN',
  () => makePerson({
    name: 'Dan',
    emergencyContact: SUE,
  }),
)

const SUE = PEOPLE.define(
  'SUE',
  (proto) => makePerson({
    name: 'Sue',
    emergencyContact: DAN,
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
    key: 'DAN.emergencyContactWithId',
    actual: DAN.emergencyContactWithId,
    expected: 'SUE: Sue',
  },
  {
    key: 'SUE.emergencyContactWithId',
    actual: SUE.emergencyContactWithId,
    expected: 'DAN: Dan',
  },
]