import { type Lazy, lazy, makeLazyFiller, staticRecords } from '../../src'
import type { TestCase } from '../types'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly emergencyContactName: string,
  readonly deep: {
    readonly property: string
  }
}

type PersonInput = {
  readonly name: string,
  readonly emergencyContactName: Lazy<string>,
  readonly deep: {
    readonly property: Lazy<string>
  }
}

const PEOPLE = staticRecords<Person, never, PersonInput>('Person', {
  filler: makeLazyFiller(),
})

const DAN = PEOPLE.define(
  'DAN',
  () => ({
    name: 'Dan',
    emergencyContactName: lazy<Person['emergencyContactName']>(() => SUE.name),
    deep: {
      property: lazy<Person['deep']['property']>(() => {
        return 'foo'
      }),
    },
  }),
)

const SUE = PEOPLE.define(
  'SUE',
  () => ({
    name: 'Sue',
    emergencyContactName: lazy(() => DAN.name),
    deep: {
      // Lazy types are optional
      // so this can be a Lazy<string> or string
      property: 'bar',
    },
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