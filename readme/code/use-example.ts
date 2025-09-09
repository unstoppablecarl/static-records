import { JIM } from './person-data'
import { CAR } from './vehicle-data'
import { getRecordType } from '../../src'
import type { TestCase } from '../types'

export const TESTS: TestCase[] = [
  {
    key: 'JIM.id',
    actual: JIM.id,
    expected: 'JIM',
  },
  {
    key: 'JIM.name',
    actual: JIM.name,
    expected: 'Jim',
  },
  {
    key: 'JIM.manager?.id',
    actual: JIM.manager?.id,
    expected: 'SUE',
  },
  {
    key: 'JIM.emergency_contact',
    actual: JIM.emergency_contact,
    expected: null,
  },
  {
    key: 'getRecordType(JIM)',
    actual: getRecordType(JIM),
    expected: 'Person',
  },
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
    key: 'CAR.driver.id',
    actual: CAR.driver.id,
    expected: 'SUE',
  },
]