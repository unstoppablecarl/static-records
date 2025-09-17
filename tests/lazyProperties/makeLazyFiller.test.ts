import { describe, expect, it, vi } from 'vitest'
import { type HasParent, lazy, type Lazy, lazyTree, recordTypeKey, staticRecords } from '../../src'
import { isProxy, objectKeysWithoutRef } from './_helpers/_helpers'
import { PROXY_KEY } from '../../src/lazyProperties/proxy'
import { getLazyProps, LAZY_PROPS } from '../../src/lazyProperties/trackLazyProps'
import { makeLazyFiller } from '../../src/lazyProperties/lazyFiller'
import type { Rec } from '../../src/type-util'

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
    filler: makeLazyFiller(),
  })

  const carAndLocation = lazyTree<string, Driver>((parent) => {
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

  it('lifecycle', () => {
    let {
      DAN,
      LISA,
    } = makeExample()

    expect(getLazyProps(DAN)).toEqual([
      'carName',
      'location',
      'carAndLocation',
    ])

    expect(getLazyProps(LISA)).toEqual(undefined)
    expect(DAN.carName).toEqual('Mustang')

    expect(getLazyProps(DAN)).toEqual([
      'location',
      'carAndLocation',
    ])

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

  it('resolver using parent argument', () => {
    const { DAN } = makeExample()

    expect(DAN.carAndLocation).toEqual('Mustang-Arizona')
  })

  it('nested resolvers', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller(),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        carName: lazy(() => 'Mustang'),
        static: {
          foo: 'bar',
        },
        location: lazyTree((parent: Rec, root: Rec) => {
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
            address: lazyTree((parent, root) => {
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

              let expectedRoot2 = {
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
              }

              expect(root).toEqual(expectedRoot2)
              expect(root).toHaveTheSameKeysAs(expectedRoot2)

              return {
                street: '401 test st.',
                extra: lazyTree((parent, root) => {

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

                  expect(root).toEqual(expectedRoot2)
                  expect(root).toHaveTheSameKeysAs(expectedRoot2)

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

  it('dual nested resolvers', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller(),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        b1: lazyTree((parent: Rec, root: Rec) => {

          expect(PROXY_KEY in parent).toBe(true)
          expect('parent' in parent).toBe(true)
          expect('location' in parent).toBe(false)
          let expectedParent1 = {
            id: 'DAN',
            name: 'Dan',
            b1: undefined,
            parent: undefined,
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'parent.b1',
            [LAZY_PROPS]: new Set(['a1']),
          }

          expect(Object.getOwnPropertyDescriptor(parent, 'b1')).toEqual({
            value: undefined,
            writable: false,
            enumerable: true,
            configurable: true,
          })

          expect(parent).toMatchObject(expectedParent1)
          expect(objectKeysWithoutRef(parent)).toEqual(Object.keys(expectedParent1).concat(['a1']).sort())

          expect(PROXY_KEY in root).toBe(true)
          expect('parent' in root).toBe(true)
          expect('location' in root).toBe(false)

          let expectedRoot = {
            id: 'DAN',
            name: 'Dan',
            b1: undefined,
            parent: undefined,
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'root.a1',
            [LAZY_PROPS]: new Set(['a1']),
          }
          expect(root).toMatchObject(expectedRoot)
          expect(objectKeysWithoutRef(root)).toEqual(Object.keys(expectedRoot).concat(['a1']).sort())

          return {
            b2: {
              b3: 'b-end',
            },
          }
        }),
        a1: lazyTree((parent: Rec, root: Rec) => {
          expect(PROXY_KEY in parent).toBe(true)
          expect('parent' in parent).toBe(true)
          expect('location' in parent).toBe(false)
          let expectedParent1 = {
            id: 'DAN',
            name: 'Dan',
            a1: undefined,
            parent: undefined,
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'parent.a1',
            [LAZY_PROPS]: new Set(['a1']),
          }

          expect(Object.getOwnPropertyDescriptor(parent, 'a1')).toEqual({
            value: undefined,
            writable: false,
            enumerable: true,
            configurable: true,
          })
          expect(parent).toMatchObject(expectedParent1)
          expect(objectKeysWithoutRef(parent)).toEqual(Object.keys(expectedParent1).concat(['b1']).sort())

          expect(PROXY_KEY in root).toBe(true)
          expect('parent' in root).toBe(true)
          expect('location' in root).toBe(false)

          let expectedRoot = {
            id: 'DAN',
            name: 'Dan',
            a1: undefined,
            parent: undefined,
            [recordTypeKey]: 'DRIVER',
            [PROXY_KEY]: 'root.a1',
            [LAZY_PROPS]: new Set(['a1']),
          }

          expect(root).toMatchObject(expectedRoot)
          expect(objectKeysWithoutRef(root)).toEqual(Object.keys(expectedRoot).concat(['b1']).sort())

          return {
            a2: lazyTree((parent: HasParent, root: HasParent) => {
              let expectedParent = {
                a2: undefined,
                parent: {
                  id: 'DAN',
                  name: 'Dan',
                  parent: undefined,
                  a1: undefined,
                  [PROXY_KEY]: 'parent.a1',
                  [recordTypeKey]: 'DRIVER',
                },
                [PROXY_KEY]: 'parent.a2',
                [LAZY_PROPS]: new Set(['a2']),
              }
              expect(parent).toMatchObject(expectedParent)
              expect(objectKeysWithoutRef(parent)).toEqual(Object.keys(expectedParent).sort())

              let expectedRoot2 = {
                id: 'DAN',
                name: 'Dan',
                a1: undefined,
                parent: undefined,
                [recordTypeKey]: 'DRIVER',
                [PROXY_KEY]: 'root.a1',
              }

              expect(root).toMatchObject(expectedRoot2)
              expect(objectKeysWithoutRef(root)).toEqual(Object.keys(expectedRoot2).concat(['b1']).sort())

              return {
                a3: lazyTree((parent: HasParent, root: HasParent) => {

                  let expectedParent = {
                    a3: undefined,
                    parent: {
                      a2: undefined,
                      parent: {
                        a1: undefined,
                        id: 'DAN',
                        name: 'Dan',
                        parent: undefined,
                        [PROXY_KEY]: 'parent.a1',
                        [recordTypeKey]: 'DRIVER',
                      },
                      [PROXY_KEY]: 'parent.a2',
                    },
                    [PROXY_KEY]: 'parent.a3',
                    [LAZY_PROPS]: new Set(['a3']),

                  }

                  expect(parent).toMatchObject(expectedParent)
                  expect(objectKeysWithoutRef(parent)).toEqual(Object.keys(expectedParent).sort())

                  expect(root).toMatchObject(expectedRoot2)
                  expect(objectKeysWithoutRef(root)).toEqual(Object.keys(expectedRoot2).concat(['b1']).sort())

                  return 'a-end'
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
      a1: {
        a2: {
          a3: 'a-end',
        },
      },
      b1: {
        b2: {
          b3: 'b-end',
        },
      },
      [recordTypeKey]: 'DRIVER',
    })
    expect(isProxy(DAN)).toBe(false)
  })

  it('nested resolvers with plain object in between', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller(),
    })

    const DAN = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        country: lazyTree((parent) => {
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
                street: lazyTree((parent: HasParent, root: HasParent) => {
                  expect(parent.street).toBe(undefined)
                  expect(root.country).toBe(undefined)

                  expect(parent).toEqual({
                    parent: {
                      address: undefined,
                      name: 'Arizona',
                      parent: {
                        name: 'USA',
                        parent: {
                          id: 'DAN',
                          name: 'Dan',
                          parent: undefined,
                          country: undefined,
                          [PROXY_KEY]: 'parent.country',
                          [recordTypeKey]: 'DRIVER',
                        },
                        state: undefined,
                        [PROXY_KEY]: 'parent.state',
                      },
                      [PROXY_KEY]: 'parent.address',
                    },
                    street: undefined,
                    [PROXY_KEY]: 'parent.street',
                    [LAZY_PROPS]: new Set(['street']),
                  })
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
      filler: makeLazyFiller(),
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
      filler: makeLazyFiller(),
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
    const THINGS = staticRecords('THINGS', {
      filler: makeLazyFiller(),
    })

    const JIM = THINGS.define(
      'JIM',
      () => ({
        name: 'Jim',
        meta: lazy(() => {
          return {
            testing: 'something',
            foo: lazyTree((parent, root) => {
              expect(parent?.parent).toEqual({
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
      filler: makeLazyFiller(),
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
      filler: makeLazyFiller(),
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
