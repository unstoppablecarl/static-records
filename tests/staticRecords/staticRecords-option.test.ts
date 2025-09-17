import { describe, expect, it } from 'vitest'
import { recordTypeKey, staticRecords } from '../../src'
import { defineAndLockVehicles } from '../_helpers/vehicles'

type Vehicle = {
  id: string,
  name: string,
  tested?: string
}

describe('staticRecords() option tests', async () => {

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