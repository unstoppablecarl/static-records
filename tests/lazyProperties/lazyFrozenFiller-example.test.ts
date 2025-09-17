import { describe, expect, it } from 'vitest'
import { recordTypeKey } from '../../src'
import { CAR } from './_helpers/frozen-vehicles-data'
import { DAN } from './_helpers/frozen-drivers-data'
import { getLazyProps } from './_helpers/_helpers'

describe('frozenFiller example', async () => {
  it('filler frozen', async () => {
    const desc = Object.getOwnPropertyDescriptor(CAR, 'driverName')
    expect(desc).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined

    expect(getLazyProps(CAR)).toEqual(new Set([
      'driverName',
      'driverIsAdult',
    ]))

    expect(CAR.driverName).toEqual('Dan')

    expect(getLazyProps(CAR)).toEqual(new Set([
      'driverIsAdult',
    ]))

    expect(CAR.driverIsAdult).toEqual(true)

    expect(getLazyProps(CAR)).toEqual(undefined)

    expect(CAR).toEqual({
      id: CAR.id,
      name: CAR.name,
      [recordTypeKey]: 'VEHICLE',
      driverName: 'Dan',
      driverIsAdult: true,
    })

    const desc2 = Object.getOwnPropertyDescriptor(DAN, 'carName')
    expect(desc2).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined

    expect(getLazyProps(DAN)).toEqual(new Set([
      'carName',
    ]))

    expect(DAN.carName).toEqual('Car')
    expect(getLazyProps(DAN)).toEqual(undefined)

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Car',
      age: 20,
    })
  })
})