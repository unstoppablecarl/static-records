import { describe, expect, it } from 'vitest'
import { getRecordType, isStaticRecord, staticRecords } from '../src'
import { recordTypeKey } from '../src/recordType'

type Vehicle = {
  id: string,
  name: string,
}
const VEHICLES = staticRecords<Vehicle>('VEHICLE')

const CAR = VEHICLES.define(
  'CAR',
  () => ({
    name: 'Car',
  }),
)
const VAN = VEHICLES.define(
  'VAN',
  () => ({
    name: 'Van',
  }),
)

VEHICLES.lock()

describe('staticRecords() unit tests', async () => {
  it('recordType', async () => {

    expect(CAR).toEqual({
      id: 'CAR',
      name: 'Car',
      [recordTypeKey]: 'VEHICLE',
    })
    expect(VAN).toEqual({
      id: 'VAN',
      name: 'Van',
      [recordTypeKey]: 'VEHICLE',
    })
  })

  it('getRecordType()', async () => {
    expect(getRecordType(CAR)).toEqual('VEHICLE')
    expect(getRecordType(VAN)).toEqual('VEHICLE')
  })

  it('.get()', async () => {
    expect(VEHICLES.get(CAR.id)).toBe(CAR)
    expect(VEHICLES.get(VAN.id)).toBe(VAN)
  })

  it('.toArray()', async () => {
    expect(VEHICLES.toArray()).toEqual([
      CAR,
      VAN,
    ])
  })

  it('.toObject()', async () => {
    const first = {
      CAR: CAR,
      VAN: VAN,
    }
    expect(VEHICLES.toObject()).toEqual(first)
    // should be new object every time
    expect(VEHICLES.toObject()).not.toBe(first)

    expect(VEHICLES.toObject()).toBeFrozen(false)

    Object.values(VEHICLES.toObject()).forEach(item => {
      expect(item).toBeFrozen(true)
    })
  })

  it('.has()', async () => {
    expect(VEHICLES.has(CAR.id)).toEqual(true)
    expect(VEHICLES.has(VAN.id)).toEqual(true)
    expect(VEHICLES.has('TRUCK')).toEqual(false)
  })

  it('isStaticRecord()', async () => {
    expect(isStaticRecord(99)).toBe(false)
    expect(isStaticRecord('foo')).toBe(false)
    expect(isStaticRecord({ id: 'foo' })).toBe(false)
    expect(isStaticRecord({ id: 'foo', [recordTypeKey]: true })).toBe(true)
  })

  it('lock()', async () => {
    const FOO = staticRecords('THING')

    expect(FOO.locked()).toBe(false)
    FOO.lock()
    expect(FOO.locked()).toBe(true)
  })
})