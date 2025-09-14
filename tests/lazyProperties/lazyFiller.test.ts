import { describe, expect, it, vi } from 'vitest'
import { lazy, type Lazy, lazyFiller, recordTypeKey, staticRecords } from '../../src'
import { getLazyProps, isProxy } from './_helpers/_helpers'
import { PROXY_KEY } from '../../src/lazyProperties/proxy'
import { LAZY_PROPS } from '../../src/lazyProperties/trackLazyProps'

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
  it('lazy property description', () => {
    const { DAN } = makeExample()
    const desc = Object.getOwnPropertyDescriptor(DAN, 'carName')
    expect(desc).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined
  })

  it('non-lazy property description', () => {
    const { DAN } = makeExample()

    const desc = Object.getOwnPropertyDescriptor(DAN, 'age')
    expect(desc).to.include({
      configurable: true,
      writable: true,
      enumerable: true,
    })
    expect(desc?.get).to.be.undefined
  })

  it('extension prevented', () => {
    const { DAN } = makeExample()

    expect(Object.isExtensible(DAN)).toBe(true)
  })

  it('lifecycle', () => {
    let {
      DAN,
      LISA,
    } = makeExample()

    expect(getLazyProps(DAN)).toEqual(new Set([
      'carName',
      'location',
      'carAndLocation',
    ]))

    expect(getLazyProps(LISA)).toEqual(undefined)
    expect(DAN.carName).toEqual('Mustang')

    expect(getLazyProps(DAN)).toEqual(new Set([
      'location',
      'carAndLocation',
    ]))

    expect(DAN.location).toEqual('Arizona')
    expect(DAN.carAndLocation).toEqual('Mustang-Arizona')

    expect(getLazyProps(DAN)).toEqual(undefined)

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Mustang',
      location: 'Arizona',
      carAndLocation: 'Mustang-Arizona',
      age: 20,
      backup: LISA,
    })
  })

  it('lifecycle PRODUCTION', () => {
    vi.stubGlobal('__DEV__', false)
    const { DAN, LISA } = makeExample()

    expect(getLazyProps(DAN)).toEqual(undefined)
    expect(DAN.carName).toEqual('Mustang')
    expect(DAN.location).toEqual('Arizona')

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Mustang',
      location: 'Arizona',
      carAndLocation: 'Mustang-Arizona',
      age: 20,
      backup: LISA,
    })
  })

  it('resolver using self argument', () => {
    const { DAN } = makeExample()

    expect(DAN.carAndLocation).toEqual('Mustang-Arizona')
  })

  it('nested resolvers', () => {
    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        carName: lazy(() => 'Mustang'),
        static: {
          foo: 'bar',
        },
        location: lazy((parent, root) => {
          console.log(root)
          // expect(parent).toBe(root)
          expect(parent).toEqual({
            id: 'DAN',
            name: 'Dan',
            carName: 'Mustang',
            parent: undefined,
            location: undefined,
            static: {
              foo: 'bar',
            },
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'Parent',
            [LAZY_PROPS]: new Set(['location']),
          })

          return {
            name: 'Arizona',
            address: lazy((parent) => {
              expect(parent).toEqual({
                address: undefined,
                name: 'Arizona',
                parent: {
                  id: 'DAN',
                  name: 'Dan',
                  carName: 'Mustang',
                  location: undefined,
                  parent: undefined,
                  static: {
                    foo: 'bar',
                  },
                  [PROXY_KEY]: 'Parent',
                  [recordTypeKey]: 'DRIVER',
                },
                [PROXY_KEY]: 'Parent',
                [LAZY_PROPS]: new Set(['address']),
              })

              return {
                street: '401 test st.',
                extra: lazy((parent) => {

                  expect(parent).toEqual({
                    street: '401 test st.',
                    extra: undefined,
                    parent: {
                      address: undefined,
                      name: 'Arizona',
                      parent: {
                        id: 'DAN',
                        name: 'Dan',
                        carName: 'Mustang',
                        location: undefined,
                        parent: undefined,
                        static: {
                          foo: 'bar',
                        },
                        [PROXY_KEY]: 'Parent',
                        [recordTypeKey]: 'DRIVER',
                      },
                      [PROXY_KEY]: 'Parent',
                    },
                    [PROXY_KEY]: 'Parent',
                    [LAZY_PROPS]: new Set(['extra']),
                  })

                  return 'something'
                }),
              }
            }),
          }
        }),
      }),
    )

    DRIVERS.lock()

    expect(DAN).toEqual({
      id: 'DAN',
      name: 'Dan',
      carName: 'Mustang',
      location: {
        name: 'Arizona',
        address: {
          extra: 'something',
          street: '401 test st.',
        },
      },
      static: {
        foo: 'bar',
      },
      [recordTypeKey]: 'DRIVER',
    })
    expect(Object.isFrozen(DAN.static)).toBe(false)
    expect(Object.isFrozen(DAN)).toBe(false)
    expect(isProxy(DAN)).toBe(false)
  })

  it('nested resolvers with plain object in between', () => {
    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const DAN = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        country: lazy((parent) => {
          expect(parent).toEqual({
            id: 'DAN',
            name: 'Dan',
            parent: undefined,
            country: undefined,
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'Parent',
            [LAZY_PROPS]: new Set(['country']),
          })

          return {
            name: 'USA',
            state: {
              name: 'Arizona',
              address: {
                street: lazy(() => {
                  return '401 test st.'
                }),
              },
            },
          }
        }),
      }),
    )

    DRIVERS.lock()

    expect(DAN).toEqual({
      id: 'DAN',
      name: 'Dan',
      country: {
        name: 'USA',
        state: {
          name: 'Arizona',
          address: {
            street: '401 test st.',

          },
        },
      },
      [recordTypeKey]: 'DRIVER',
    })
    expect(isProxy(DAN)).toBe(false)
  })

  it('circular referenced static objects', () => {
    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const alpha: any = {
      name: 'alpha',
    }

    const beta: any = {
      name: 'beta',
      ref: alpha,
    }

    alpha.ref = beta

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        alpha,
        beta,
      }),
    )

    DRIVERS.lock()

    expect(DAN.alpha).toBe(alpha)
    expect(DAN.beta).toBe(beta)
    expect(isProxy(DAN)).toBe(false)
  })

  it('circular referenced resolvers', () => {
    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const alpha: any = {
      name: 'alpha',
    }

    const beta: any = {
      name: 'beta',
      ref: alpha,
    }

    alpha.ref = beta

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        alpha: lazy(() => alpha),
        beta: lazy(() => beta),
      }),
    )

    DRIVERS.lock()

    expect(DAN.alpha).toBe(alpha)
    expect(DAN.beta).toBe(beta)
    expect(isProxy(DAN)).toBe(false)
  })
})
