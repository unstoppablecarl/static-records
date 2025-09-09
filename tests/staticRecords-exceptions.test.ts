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
    }).toThrowError('Cannot lock() when Static Record Type "VEHICLE" is already locked.')
  })

  it('define() with duplicate', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE')

    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        name: 'Car',
      }),
    )

    expect(() => {
      VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car2',
        }),
      )
    }).toThrowError('A Static Record Type "VEHICLE" with id "CAR" already exists.')
  })

  it('.get() not found', async () => {
    const VEHICLES = staticRecords<Vehicle>('VEHICLE')

    expect(() => VEHICLES.get('TRUCK')).toThrowError('Cannot find a Static Record Type "VEHICLE" with id "TRUCK".')
  })
})
