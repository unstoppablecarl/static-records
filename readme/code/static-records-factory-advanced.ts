import { type DefaultProtoItem, recordTypeKey, staticRecordsFactory } from '../../src'
import type { TestCase } from '../types'

// base type for all items
export type BaseItem = {
  id: string,
  uid: string,
  zone: string,
}

// base type of all proto objects
export type BaseProtoItem = DefaultProtoItem & {
  uid: string,
}

// input that will be required by all record inputs
export type BaseInput = {
  zone: string,
}

export const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem, BaseInput>({
  // returns BaseProtoItem
  creator(id, recordType) {
    return {
      id,
      [recordTypeKey]: recordType,
      // adding unique id from BaseProtoItem
      uid: `${recordType}-${id}`,
    }
  },
})

export type Building = BaseItem & {
  name: string,
}

// optionally add more to the proto object
export type BuildingProto = BaseProtoItem & {
  moreProtoData: string,
}

export type BuildingInput = BaseInput & {
  name: string,
}
export const BUILDINGS = makeStaticRecords<Building, BuildingProto, BuildingInput>('Building', {
  // options here override the factory options above via Object.assign(factoryOptions, recordOptions)
  filler(item, input) {
    // @TODO validate item.zone
    Object.assign(item, input)
  },
})

export const TOWER_A = BUILDINGS.define(
  'TOWER_A',
  () => ({
    name: 'Tower A',
    zone: 'Alpha',
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
  {
    key: 'TOWER_A.zone',
    actual: TOWER_A.zone,
    expected: 'Alpha',
  },
]