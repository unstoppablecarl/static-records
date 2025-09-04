import { describe, expect, it } from 'vitest'
import { staticRecords } from '../src'

type Vehicle = {
  id: string,
  name: string,
  tested?: boolean
}

describe('staticRecords() exceptions', async () => {
  it('cannot define() after lock()', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE')

    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        name: 'Car',
      }),
    )

    VEHICLES.lock()
    expect(() => {

    const VAN = VEHICLES.define(
      'VAN',
      () => ({
        name: 'Van',
      }),
    )
    }).toThrowError('Cannot define() after locking Static Records "VEHICLE".')
  })

  it('cannot lock() more than once', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE')

    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        name: 'Car',
      }),
    )

    VEHICLES.lock()
    expect(() => {

      VEHICLES.lock()
    }).toThrowError('Cannot lock() when Static Records "VEHICLE" are already locked.')
  })
})
