import { lazy, type MakeInput, makeLazyFiller, staticRecords } from '../../src'
import type { TestCase } from '../types'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly emergencyContactName: string,
  readonly deep: {
    readonly val: string,
    readonly property: {
      readonly text: string,
    }
  }
}
type PersonInput = MakeInput<Person>
const PEOPLE = staticRecords<Person>('Person', {
  filler: makeLazyFiller(),
})

const DAN = PEOPLE.define(
  'DAN',
  () => ({
    name: 'Dan',
    emergencyContactName: lazy<PersonInput['emergencyContactName']>(() => SUE.name),
    deep: {
      val: 'foo',
      property: {
        text: 'whatever',
      },
    },
  }),
)

const SUE = PEOPLE.define(
  'SUE',
  () => ({
    name: 'Sue',
    emergencyContactName: lazy(() => DAN.name),
    deep: lazy<PersonInput['deep']>(() => {
      return {
        val: 'something',
        property: {
          text: lazy<PersonInput['deep']['property']['text']>(() => DAN.name),
        },
      }
    }),
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