import { describe, expect, it, vi } from 'vitest'
import { lazy, type Lazy, lazyFiller, recordTypeKey, staticRecords } from '../../src'
import { getLazyProps, isProxy } from './_helpers/_helpers'

function makeExample() {
  type Driver = {
    id: string,
    name: string,
    carName: string,
    location: string,
    carAndLocation: string,
    backup?: Driver,
  }

  type DriverInput = {
    name: string,
    age: number,
    carName: Lazy<string>,
    location: Lazy<string>,
    carAndLocation: Lazy<string>,
    backup?: Driver,
  }

  const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
    freezer: false,
    filler: lazyFiller,
  })

  const carAndLocation = lazy((self: Driver) => {
    return `${self.carName}-${self.location}`
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
      carAndLocation,
      backup: LISA,
    }),
  )

  const LISA = DRIVERS.define(
    'LISA',
    () => ({
      name: 'Lisa',
      age: 16,
      carName: 'Pacer',
      location: 'Texas',
      carAndLocation: 'custom value',
    }),
  )

  DRIVERS.lock()

  return { DAN, LISA, DRIVERS }
}

describe('lazyFiller', () => {
  // it('lazy property description', () => {
  //   const { DAN } = makeExample()
  //   const desc = Object.getOwnPropertyDescriptor(DAN, 'carName')
  //   expect(desc).to.include({
  //     configurable: true,
  //     enumerable: true,
  //   })
  //   expect(desc?.get).to.not.be.undefined
  // })
  //
  // it('non-lazy property description', () => {
  //   const { DAN } = makeExample()
  //
  //   const desc = Object.getOwnPropertyDescriptor(DAN, 'age')
  //   expect(desc).to.include({
  //     configurable: true,
  //     writable: true,
  //     enumerable: true,
  //   })
  //   expect(desc?.get).to.be.undefined
  // })
  //
  // it('extension prevented', () => {
  //   const { DAN } = makeExample()
  //
  //   expect(Object.isExtensible(DAN)).toBe(true)
  // })
  //
  // it('lifecycle', () => {
  //   let {
  //     DAN,
  //     LISA,
  //   } = makeExample()
  //
  //   expect(getLazyProps(DAN)).toEqual(new Set([
  //     'carName',
  //     'location',
  //     'carAndLocation',
  //   ]))
  //
  //   expect(getLazyProps(LISA)).toEqual(undefined)
  //   expect(DAN.carName).toEqual('Mustang')
  //
  //   expect(getLazyProps(DAN)).toEqual(new Set([
  //     'location',
  //     'carAndLocation',
  //   ]))
  //
  //   expect(DAN.location).toEqual('Arizona')
  //   expect(DAN.carAndLocation).toEqual('Mustang-Arizona')
  //
  //   expect(getLazyProps(DAN)).toEqual(undefined)
  //
  //   expect(DAN).toEqual({
  //     id: DAN.id,
  //     name: DAN.name,
  //     [recordTypeKey]: 'DRIVER',
  //     carName: 'Mustang',
  //     location: 'Arizona',
  //     carAndLocation: 'Mustang-Arizona',
  //     age: 20,
  //     backup: LISA,
  //   })
  // })
  //
  // it('lifecycle PRODUCTION', () => {
  //   vi.stubGlobal('__DEV__', false)
  //   const { DAN, LISA } = makeExample()
  //
  //   expect(getLazyProps(DAN)).toEqual(undefined)
  //   expect(DAN.carName).toEqual('Mustang')
  //   expect(DAN.location).toEqual('Arizona')
  //
  //   expect(DAN).toEqual({
  //     id: DAN.id,
  //     name: DAN.name,
  //     [recordTypeKey]: 'DRIVER',
  //     carName: 'Mustang',
  //     location: 'Arizona',
  //     carAndLocation: 'Mustang-Arizona',
  //     age: 20,
  //     backup: LISA,
  //   })
  // })
  //
  // it('resolver using self argument', () => {
  //   const { DAN } = makeExample()
  //
  //   expect(DAN.carAndLocation).toEqual('Mustang-Arizona')
  // })

  it('nested resolvers', () => {

    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const DAN = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        carName: lazy(() => 'Mustang'),
        static: {
            foo: 'bar'
        },
        location: lazy((self) => {

          expect(isProxy(self)).toBe(true)
          expect(self.id).toBe('DAN')
          expect(self.name).toBe('Dan')
          expect(self.carName).toBe('Mustang')
          expect(self.parent).toBe(undefined)
          expect(Object.keys(self)).toEqual([
            'parent',
            'location',
            'id',
            'name',
            'carName',
            'static',
          ])
          expect(
            () => self.location,
          ).toThrowError('cannot read self property: "location" inside its own resolver')

          return {
            name: 'Arizona',
            address: lazy((self) => {
              expect(isProxy(self)).toBe(true)
              expect(self.name).toBe('Arizona')
              expect(
                () => self.address,
              ).toThrowError('cannot read self property: "address" inside its own resolver')
              expect(Object.keys(self)).toEqual([
                'parent',
                'address',
                'name',
              ])
              expect(self.parent).not.toBe(undefined)
              expect(self.parent?.name).toBe('Dan')
              expect(self.parent?.carName).toBe('Mustang')
              expect(Object.keys(self.parent as {})).toEqual([
                'parent',
                'location',
                'id',
                'name',
                'carName',
                'static',
              ])

              expect(
                () => self.parent?.location,
              ).toThrowError('cannot read self property: "location" inside its own resolver')

              expect(self.parent?.name).toBe('Dan')

              return {
                street: '401 test st.',
                extra: lazy((self) => {
                  expect(
                    () => self.extra,
                  ).toThrowError('cannot read self property: "extra" inside its own resolver')

                  expect(
                    () => self.parent?.address,
                  ).toThrowError('cannot read self property: "address" inside its own resolver')

                  return 'something'
                }),
              }
            }),
          }
        }),
      }),
    )

    DRIVERS.lock()

    expect((DAN as any).location.address).toEqual({
      street: '401 test st.',
      extra: 'something'
    })

    expect(DAN).toEqual({
      id: 'DAN',
      name: 'Dan',
      carName: 'Mustang',
      location: {
        name: 'Arizona',
        address: {
          extra: 'something',
          street: '401 test st.'
        }
      },
      static: {
        foo: 'bar'
      },
      [recordTypeKey]: 'DRIVER'
    })
    expect(isProxy(DAN)).toBe(false)
  })
})
