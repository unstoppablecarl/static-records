import { describe, expect, it } from 'vitest'
import { recordTypeKey, staticRecords } from '../../src'
import { defineAndLockVehicles } from '../_helpers/vehicles'
import type { Rec } from '../../src/type-util'

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
    expect(CAR).toBeFrozen(false)
    expect(VAN).toBeFrozen(false)
  })

  it('options.freezer = false', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      freezer: false,
    })
    const { CAR, VAN } = defineAndLockVehicles(VEHICLES)

    expect(CAR).toBeFrozen(false)
    expect(VAN).toBeFrozen(false)
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

  it('options.filler gets freezer argument', async () => {

    let tested = false

    const freezer = (record: Rec): Rec => {
      record.tested = 'freezer'
      return record
    }

    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      freezer,
      filler: (item, input, freezerArg) => {
        expect(freezerArg).toBe(freezer)
        Object.assign(item, input)
        tested = true
      },
    })

    const { CAR, VAN } = defineAndLockVehicles(VEHICLES)

    expect(CAR.tested).toBe('freezer')
    expect(VAN.tested).toBe('freezer')
    expect(CAR).toBeFrozen(false)
    expect(VAN).toBeFrozen(false)
    expect(tested).toBe(true)
  })
})