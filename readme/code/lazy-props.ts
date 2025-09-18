import { lazy, makeLazyFiller, staticRecords } from '../../src'
import type { TestCase } from '../types'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly emergencyContactName: string,
}

const PEOPLE = staticRecords<Person>('Person', {
  filler: makeLazyFiller(),
})

const DAN = PEOPLE.define(
  'DAN',
  () => ({
    name: 'Dan',
    emergencyContactName: lazy(() => SUE.name) as string,
  }),
)

const SUE = PEOPLE.define(
  'SUE',
  () => ({
    name: 'Sue',
    emergencyContactName: lazy(() => DAN.name) as string,
  }),
)
PEOPLE.lock()

export const TESTS: TestCase[] = [
  {
    key: 'DAN.emergencyContactName',
    actual: DAN.emergencyContactName,
    expected: 'Sue',
  },
  {
    key: 'SUE.emergencyContactName',
    actual: SUE.emergencyContactName,
    expected: 'Dan',
  },
]