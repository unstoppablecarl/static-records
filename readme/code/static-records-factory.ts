import { type DefaultProtoItem, recordTypeKey, staticRecordsFactory } from '../../src'
import type { TestCase } from '../types'

export type BaseItem = {
  readonly id: string,
  readonly uid: string,
}

type BaseProtoItem = BaseItem & DefaultProtoItem & {
  readonly uid: string,
}

export const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem>({
  creator(id, recordType) {
    return {
      // adding unique id
      uid: `${recordType}-${id}`,
      id,
      [recordTypeKey]: recordType,
    }
  },
})

export type Building = BaseItem & {
  readonly name: string,
}
export const BUILDINGS = makeStaticRecords<Building>('Building')

export const TOWER_A = BUILDINGS.define(
  'TOWER_A',
  () => ({
    name: 'Tower A',
  }),
)

BUILDINGS.lock()

export const TESTS: TestCase[] = [
  {
    key: 'TOWER_A.id',
    actual: TOWER_A.id,
    expected: 'TOWER_A',
  },
  {
    key: 'TOWER_A.name',
    actual: TOWER_A.name,
    expected: 'Tower A',
  },
  {
    key: 'TOWER_A.uid',
    actual: TOWER_A.uid,
    expected: 'Building-TOWER_A',
  },
]