import { describe, expect, it } from 'vitest'
import { staticRecordsFactory } from '../src/staticRecordsFactory'
import { defineAndLockVehicles } from './helpers/vehicles'
import { recordTypeKey } from '../src'

type Vehicle = {
  id: string,
  name: string,
  tested?: string
}

describe('staticTypeFactory() tests', async () => {
  describe('options.freezer = custom', async () => {
    const makeStaticRecords = staticRecordsFactory({
      freezer: (record) => {
        // @ts-expect-error
        record.tested = 'freezer'
        return record
      },
    })

    it('factory with no options', async () => {
      const VEHICLES = makeStaticRecords<Vehicle>('VEHICLE')
      const { CAR, VAN } = defineAndLockVehicles<Vehicle>(VEHICLES)

      expect(CAR.tested).toBe('freezer')
      expect(Object.isFrozen(CAR)).toBe(false)
      expect(VAN.tested).toBe('freezer')
      expect(Object.isFrozen(VAN)).toBe(false)
    })

    it('factory options.freezer = false', async () => {
      const VEHICLES2 = makeStaticRecords<Vehicle>('VEHICLE', {
        freezer: false,
      })
      const { CAR, VAN } = defineAndLockVehicles<Vehicle>(VEHICLES2)
      expect(CAR.tested).toBe(undefined)
      expect(Object.isFrozen(CAR)).toBe(false)
      expect(VAN.tested).toBe(undefined)
      expect(Object.isFrozen(VAN)).toBe(false)
    })
  })

  describe('options.creator = custom', async () => {
    const makeStaticRecords = staticRecordsFactory({
      creator: (id, recordType) => {
        return {
          id,
          [recordTypeKey]: recordType,
          tested: 'creator default',
        }
      },
    })

    it('factory with no options', async () => {
      const VEHICLES = makeStaticRecords<Vehicle>('VEHICLE')
      const { CAR, VAN } = defineAndLockVehicles<Vehicle>(VEHICLES)

      expect(CAR.tested).toBe('creator default')
      expect(VAN.tested).toBe('creator default')
    })

    it('factory options.creator = override', async () => {
      const VEHICLES2 = makeStaticRecords<Vehicle>('VEHICLE', {
        creator: (id, recordType) => {
          return {
            id,
            [recordTypeKey]: recordType,
            tested: 'creator override',
          }
        },
      })
      const { CAR, VAN } = defineAndLockVehicles<Vehicle>(VEHICLES2)
      expect(CAR.tested).toBe('creator override')
      expect(VAN.tested).toBe('creator override')
    })
  })
})