import { describe, expect, it } from 'vitest'
import { recordTypeKey, staticRecords } from '../src'
import { defineAndLockVehicles } from './helpers/vehicles'

type Vehicle = {
  id: string,
  name: string,
  tested?: string
}

describe('staticRecords() option tests', async () => {
  it('options.freezer = custom', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      freezer: (record) => {
        record.tested = 'freezer'
        return record
      },
    })

    const { CAR, VAN } = defineAndLockVehicles(VEHICLES)

    expect(CAR.tested).toBe('freezer')
    expect(VAN.tested).toBe('freezer')
    expect(Object.isFrozen(CAR)).toBe(false)
    expect(Object.isFrozen(VAN)).toBe(false)
  })

  it('options.freezer = false', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      freezer: false,
    })
    const { CAR, VAN } = defineAndLockVehicles(VEHICLES)

    expect(Object.isFrozen(CAR)).toBe(false)
    expect(Object.isFrozen(VAN)).toBe(false)
  })

  it('options.filler = custom', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      filler: (item, input) => {
        Object.assign(item, {
          ...input,
          tested: 'filler',
        })
      },
    })
    const { CAR, VAN } = defineAndLockVehicles(VEHICLES)

    expect(CAR.tested).toBe('filler')
    expect(VAN.tested).toBe('filler')
  })

  it('options.creator = custom', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      creator: (id, recordType) => {
        return {
          id,
          [recordTypeKey]: recordType,
          tested: 'creator',
        }
      },
    })
    const { CAR, VAN } = defineAndLockVehicles(VEHICLES)

    expect(CAR.tested).toBe('creator')
    expect(VAN.tested).toBe('creator')
  })
})