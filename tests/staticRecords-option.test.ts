import { describe, expect, it } from 'vitest'
import { staticRecords } from '../src'

type Vehicle = {
  id: string,
  name: string,
  tested?: boolean
}

describe('staticRecords() option tests', async () => {
  it('options.freezer = custom', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      freezer: (record) => {
        // @ts-expect-error
        record.tested = true
        return record
      },
    })

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

    expect(CAR.tested).toBe(true)
    expect(Object.isFrozen(CAR)).toBe(false)
    expect(Object.isFrozen(VAN)).toBe(false)

    Object.values(VEHICLES.toObject()).forEach(item => {
      expect(Object.isFrozen(item)).toBe(false)
    })
  })

  it('options.freezer = false', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE', {
      freezer: false,
    })

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
    expect(Object.isFrozen(CAR)).toBe(false)
    expect(Object.isFrozen(VAN)).toBe(false)

    Object.values(VEHICLES.toObject()).forEach(item => {
      expect(Object.isFrozen(item)).toBe(false)
    })
  })
})
