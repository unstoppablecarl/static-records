import { describe, expect, it } from 'vitest'
import { LAZY_PROPS, recordTypeKey } from '../../src'
import { CAR } from './_helpers/frozen-vehicles-data'
import { DAN } from './_helpers/frozen-drivers-data'

describe('lazy', async () => {
  it('filler frozen', async () => {
    const desc = Object.getOwnPropertyDescriptor(CAR, 'driverName')
    expect(desc).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined

    // @ts-expect-error
    expect(CAR[LAZY_PROPS]).toEqual(new Set([
      'driverName',
      'driverIsAdult'
    ]))

    console.log(CAR)
    expect(CAR.driverName).toEqual('Dan')

    // @ts-expect-error
    expect(CAR[LAZY_PROPS]).toEqual(new Set([
      'driverIsAdult'
    ]))

    expect(CAR.driverIsAdult).toEqual(true)

    // @ts-expect-error
    expect(CAR[LAZY_PROPS]).toEqual(undefined)

    expect(CAR).toEqual({
      id: CAR.id,
      name: CAR.name,
      [recordTypeKey]: 'VEHICLE',
      driverName: 'Dan',
      driverIsAdult: true
    })

    const desc2 = Object.getOwnPropertyDescriptor(DAN, 'carName')
    expect(desc2).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined

    // @ts-expect-error
    expect(DAN[LAZY_PROPS]).toEqual(new Set([
      'carName'
    ]))

    expect(DAN.carName).toEqual('Car')

    // @ts-expect-error
    expect(DAN[LAZY_PROPS]).toEqual(undefined)

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Car',
      age: 20,
    })
  })
})