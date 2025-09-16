import { describe, expect, it, vi } from 'vitest'
import { lazy, type Lazy, lazyFiller, recordTypeKey, staticRecords } from '../../src'
import { getLazyProps, isProxy } from './_helpers/_helpers'
import { PROXY_KEY } from '../../src/lazyProperties/proxy'
import { LAZY_PROPS } from '../../src/lazyProperties/trackLazyProps'
import { makeLazyFiller } from '../../src/lazyProperties/lazyFiller'

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
    carAndLocation: Lazy<string, Driver>,
    backup?: Driver,
  }

  const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
    freezer: false,
    filler: lazyFiller,
  })

  const carAndLocation = lazy((parent: Driver) => {
    return `${parent.carName}-${parent.location}`
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

  it('extension not prevented', () => {
    const { DAN } = makeExample()

    expect(DAN).toBeExtensible(true)
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
          expect(PROXY_KEY in parent).toBe(true)
          expect('parent' in parent).toBe(true)
          expect('location' in parent).toBe(false)
          let expectedParent1 = {
            id: 'DAN',
            name: 'Dan',
            carName: 'Mustang',
            parent: undefined,
            location: undefined,
            static: {
              foo: 'bar',
            },
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'parent.location',
            [LAZY_PROPS]: new Set(['location']),
          }
          expect(parent).toEqual(expectedParent1)
          expect(parent).toHaveTheSameKeysAs(expectedParent1)

          expect(PROXY_KEY in root).toBe(true)
          expect('parent' in root).toBe(true)
          expect('location' in root).toBe(false)

          let expectedRoot = {
            id: 'DAN',
            name: 'Dan',
            carName: 'Mustang',
            parent: undefined,
            location: undefined,
            static: {
              foo: 'bar',
            },
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'root.location',
            [LAZY_PROPS]: new Set(['location']),
          }
          expect(root).toEqual(expectedRoot)
          expect(root).toHaveTheSameKeysAs(expectedRoot)

          return {
            name: 'Arizona',
            address: lazy((parent) => {
              let expectedParent = {
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
                  [PROXY_KEY]: 'parent.location',
                  [recordTypeKey]: 'DRIVER',
                },
                [PROXY_KEY]: 'parent.address',
                [LAZY_PROPS]: new Set(['address']),
              }
              expect(parent).toEqual(expectedParent)
              expect(parent).toHaveTheSameKeysAs(expectedParent)

              return {
                street: '401 test st.',
                extra: lazy((parent) => {

                  let expectedParent = {
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
                        [PROXY_KEY]: 'parent.location',
                        [recordTypeKey]: 'DRIVER',
                      },
                      [PROXY_KEY]: 'parent.address',
                    },
                    [PROXY_KEY]: 'parent.extra',
                    [LAZY_PROPS]: new Set(['extra']),
                  }
                  expect(parent).toEqual(expectedParent)
                  expect(parent).toHaveTheSameKeysAs(expectedParent)

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
    expect(DAN).toBeFrozen(false)
    expect(DAN.static).toBeFrozen(false)
    expect(DAN).toBeFrozen(false)
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
            [PROXY_KEY]: 'parent.country',
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

  it('makeLazyFiller defaults', () => {
    const filler = makeLazyFiller()
    const THINGS = staticRecords('THINGS', {
      filler,
      freezer: false,
    })

    const JIM = THINGS.define(
      'JIM',
      () => ({
        name: 'Jim',
        meta: lazy((parent) => {
          return {
            testing: 'something',
            foo: lazy((parent) => {
              expect(parent.parent).toEqual({
                id: 'JIM',
                name: 'Jim',
                parent: undefined,
                [PROXY_KEY]: 'parent.meta',
                [recordTypeKey]: 'THINGS',
              })

              return 'bar'
            }),
          }
        }),
      }),
    )
    THINGS.lock()

    expect(JIM).toBeFrozen(false)
    expect(JIM).toEqual({
      id: 'JIM',
      name: 'Jim',
      meta: {
        testing: 'something',
        foo: 'bar',
      },
      [recordTypeKey]: 'THINGS',
    })
  })

  it('circular referenced lazy objects', () => {
    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const a: any = {
      name: lazy(() => 'a'),
      ref: null,
    }
    const b: any = {
      name: lazy(() => 'b'),
      ref: a,
    }
    a.ref = b

    const alpha: any = {
      name: 'alpha',
      sub: {
        ref: null,
      },
      sub1: {
        ref: a,
      },
      sub2: {
        ref: b,
      },
      meta: lazy(() => {
        return 'alpha-meta'
      }),
    }

    const beta: any = {
      name: 'beta',
      sub: {
        ref: alpha,
      },
      meta: lazy(() => {
        return 'alpha-beta'
      }),
    }

    alpha.sub.ref = beta

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
    expect(DAN.alpha).toBeFrozen(false)
    expect(DAN.beta).toBeFrozen(false)
    expect(Object.isExtensible(DAN)).toBe(true)

    expect(isProxy(DAN)).toBe(false)
  })

  it('test array', () => {
    const DRIVERS = staticRecords('DRIVER', {
      freezer: false,
      filler: lazyFiller,
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        stuff: [
          lazy(() => 'a'),
          lazy(() => 'b'),
          lazy(() => 'c'),
        ],
        extra: lazy(() => [
          'a', 'b', 'c',
        ]),
      }),
    )

    DRIVERS.lock()

    expect(DAN.stuff).toEqual(['a', 'b', 'c'])
    expect(DAN.stuff[0]).toBe('a')
    expect(DAN.stuff[1]).toBe('b')
    expect(DAN.stuff[2]).toBe('c')

    expect(DAN.extra).toEqual(['a', 'b', 'c'])
  })
})
