import { describe, expect, it, vi } from 'vitest'
import { lazy, type Lazy, lazyFrozenFiller, recordTypeKey, staticRecords } from '../../src'
import { getLazyProps } from './_helpers/_helpers'

describe('frozenFiller', () => {
  type Driver = {
    id: string,
    name: string,
    carName: string,
    location: string,
  }

  type DriverInput = {
    name: string,
    age: number,
    carName: Lazy<string>
    location: Lazy<string>
  }

  const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
    freezer: false,
    filler: lazyFrozenFiller,
  })

  const DAN = DRIVERS.define(
    'DAN',
    () => ({
      name: 'Dan',
      age: 20,
      carName: lazy(() => {
        return 'Mustang'
      }),
      location: lazy(() => {
        return 'Arizona'
      }),
    }),
  )
  DRIVERS.lock()

  it('lazy property description', () => {
    const desc = Object.getOwnPropertyDescriptor(DAN, 'carName')
    expect(desc).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined
  })

  it('non-lazy property description', () => {
    const desc = Object.getOwnPropertyDescriptor(DAN, 'age')
    expect(desc).to.include({
      configurable: false,
      writable: false,
      enumerable: true,
    })
    expect(desc?.get).to.be.undefined
  })

  it('extension prevented', () => {
    expect(Object.isExtensible(DAN)).toBe(false)
  })

  it('lifecycle', () => {
    expect(getLazyProps(DAN)).toEqual(new Set([
      'carName',
      'location',
    ]))

    expect(DAN.carName).toEqual('Mustang')

    expect(getLazyProps(DAN)).toEqual(new Set([
      'location',
    ]))

    expect(DAN.location).toEqual('Arizona')

    expect(getLazyProps(DAN)).toEqual(undefined)

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Mustang',
      location: 'Arizona',
      age: 20,
    })
  })

  it('lifecycle PRODUCTION', () => {
    vi.stubGlobal('__DEV__', false)

    expect(getLazyProps(DAN)).toEqual(undefined)
    expect(DAN.carName).toEqual('Mustang')
    expect(DAN.location).toEqual('Arizona')

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Mustang',
      location: 'Arizona',
      age: 20,
    })
  })
})