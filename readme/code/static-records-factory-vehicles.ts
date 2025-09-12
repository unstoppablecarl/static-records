import { makeStaticRecords } from './static-records-factory'
import type { TestCase } from '../types'

export type Vehicle = {
  uid: string,
  id: string,
  name: string,
}
export const VEHICLES = makeStaticRecords<Vehicle>('Vehicle')

export const CAR = VEHICLES.define(
  'CAR',
  () => ({
    name: 'Car',
  }),
)

VEHICLES.lock()

export const TESTS: TestCase[] = [
  {
    key: 'CAR.id',
    actual: CAR.id,
    expected: 'CAR',
  },
  {
    key: 'CAR.name',
    actual: CAR.name,
    expected: 'Car',
  },
  {
    key: 'CAR.uid',
    actual: CAR.uid,
    expected: 'Contact',
  },
]