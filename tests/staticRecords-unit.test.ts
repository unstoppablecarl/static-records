import { describe, expect, it } from 'vitest'
import { getRecordType, isStaticRecord, staticKey, staticRecords } from '../src'

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
      [staticKey]: 'VEHICLE',
    })
    expect(VAN).toEqual({
      id: 'VAN',
      name: 'Van',
      [staticKey]: 'VEHICLE',
    })
  })

  it('lock mutation', async () => {
    expect(getRecordType(CAR)).toEqual('VEHICLE')
    expect(getRecordType(VAN)).toEqual('VEHICLE')
  })

  it('.get()', async () => {
    expect(VEHICLES.get(CAR.id)).toBe(CAR)
    expect(VEHICLES.get(VAN.id)).toBe(VAN)
  })

  it('.get() not found', async () => {
    expect(() => VEHICLES.get('TRUCK')).toThrowError('Cannot find TRUCK in Static Records')
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

    expect(Object.isFrozen(VEHICLES.toObject())).toBe(false)

    Object.values(VEHICLES.toObject()).forEach(item => {
      expect(Object.isFrozen(item)).toBe(true)
    })
  })

  it('.has()', async () => {
    expect(VEHICLES.has(CAR.id)).toEqual(true)
    expect(VEHICLES.has(VAN.id)).toEqual(true)
    expect(VEHICLES.has('TRUCK')).toEqual(false)
  })

  it('.map()', async () => {
    const result = VEHICLES.map((item) => {
      return {
        item,
      }
    })

    expect(result).toEqual([
      {
        item: CAR,
      },
      {
        item: VAN,
      },
    ])
  })

  it('.map() with this', async () => {
    const t = { this: 'this' }
    const result = VEHICLES.map(function(item) {
      return {
        item,
        // @ts-expect-error
        t: this,
      }
    }, t)

    expect(result).toEqual([
      {
        item: CAR,
        t,
      },
      {
        item: VAN,
        t,
      },
    ])
  })

  it('.forEach()', async () => {
    const result = [] as any[]
    VEHICLES.forEach((item) => {
      result.push({
        item,
      })
    })

    expect(result).toEqual([
      {
        item: CAR,
      },
      {
        item: VAN,
      },
    ])
  })

  it('.forEach() with this', async () => {
    const t = { this: 'this' }
    const result = [] as any[]
    VEHICLES.forEach(function(item) {
      result.push({
        item,
        // @ts-expect-error
        t: this,
      })
    }, t)

    expect(result).toEqual([
      {
        item: CAR,
        t,
      },
      {
        item: VAN,
        t,
      },
    ])
  })

  it('.filter()', async () => {
    const result = VEHICLES.filter((item) => {
      return item.id === CAR.id
    })

    expect(result).toEqual([
      CAR,
    ])
  })

  it('.filter() with this', async () => {
    const t = { this: 'this' }
    const result = VEHICLES.filter(function(item) {

      // @ts-expect-error
      expect(this).toBe(t)

      return item.id === CAR.id
    }, t)

    expect(result).toEqual([
      CAR,
    ])
  })

  it('isStaticRecord()', async () => {
    expect(isStaticRecord(99)).toBe(false)
    expect(isStaticRecord('foo')).toBe(false)
    expect(isStaticRecord({id: 'foo'})).toBe(true)
    expect(isStaticRecord({id: 'foo', [staticKey]: true})).toBe(false)
  })
})