import { describe, expect, it } from 'vitest'
import { makeLazyFiller } from '../../src/lazyProperties/lazyFiller'
import { lazy, recordTypeKey, staticRecords } from '../../src'
import { PROXY_KEY } from '../../src/lazyProperties/proxy'
import { LAZY_PROPS } from '../../src/lazyProperties/trackLazyProps'

describe('makeLazyFiller', () => {
  it('makeLazyFiller freeze = true', () => {
    const filler = makeLazyFiller({
      freeze: true,
    })
    const THINGS = staticRecords('THINGS', {
      filler,
      freezer: false,
    })

    const JIM = THINGS.define(
      'JIM',
      () => ({
        name: 'Jim',
      }),
    )
    THINGS.lock()

    expect(JIM).toBeFrozen(true)
  })

  it('makeLazyFiller freeze = true with lazy props', () => {

    const filler = makeLazyFiller({
      freeze: true,
    })
    const THINGS = staticRecords('THINGS', {
      filler,
      freezer: false,
    })

    const JIM = THINGS.define(
      'JIM',
      () => ({
        name: 'Jim',
        meta: lazy((parent) => {
          let expectedParent = {
            id: 'JIM',
            name: 'Jim',
            meta: undefined,
            parent: undefined,
            [PROXY_KEY]: 'parent.meta',
            [recordTypeKey]: 'THINGS',
          }
          expect(parent).toMatchObject(expectedParent)
          expect(parent).toHaveTheSameKeysAs(expectedParent)

          return {
            testing: 'something',
            foo: lazy((parent) => {

              const expectedGrandParent = {
                id: 'JIM',
                name: 'Jim',
                meta: undefined,
                parent: undefined,
                [PROXY_KEY]: 'parent.meta',
                [recordTypeKey]: 'THINGS',
              }

              const expectedParent = {
                testing: 'something',
                foo: undefined,
                parent: expectedGrandParent,
                [PROXY_KEY]: 'parent.foo',
                [LAZY_PROPS]: new Set(['foo']),
              }
              expect(parent).toEqual(expectedParent)
              expect(parent).toHaveTheSameKeysAs(expectedParent)

              expect(parent.parent).toEqual(expectedGrandParent)
              expect(parent.parent).toHaveTheSameKeysAs(expectedGrandParent)

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
    const desc = Object.getOwnPropertyDescriptor(JIM, 'meta')

    expect(desc).toEqual({
      writable: false,
      configurable: true,
      enumerable: true,
      value: {
        foo: 'bar',
        'testing': 'something',
      },
    })
  })

  it('freeze = false property description', () => {
    const filler = makeLazyFiller({
      parentKey: '__parent',
    })
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
              return 'bar'
            }),
          }
        }),
      }),
    )
    THINGS.lock()

    expect(JIM).toEqual({
      id: 'JIM',
      name: 'Jim',
      meta: {
        testing: 'something',
        foo: 'bar',
      },
      [recordTypeKey]: 'THINGS',
    })

    const desc = Object.getOwnPropertyDescriptor(JIM, 'meta')

    expect(desc).toEqual({
      writable: true,
      configurable: true,
      enumerable: true,
      value: {
        foo: 'bar',
        'testing': 'something',
      },
    })
  })

  it('makeLazyFiller freeze = true with lazy props', () => {

    const filler = makeLazyFiller({
      freeze: true,
    })
    const THINGS = staticRecords('THINGS', {
      filler,
      freezer: false,
    })

    const JIM = THINGS.define(
      'JIM',
      () => ({
        name: 'Jim',
        meta: lazy((parent) => {
          let expectedParent = {
            id: 'JIM',
            name: 'Jim',
            meta: undefined,
            parent: undefined,
            [PROXY_KEY]: 'parent.meta',
            [recordTypeKey]: 'THINGS',
            [LAZY_PROPS]: new Set(['meta']),
          }
          expect(parent).toEqual(expectedParent)
          expect(parent).toHaveTheSameKeysAs(expectedParent)

          return {
            testing: 'something',
            foo: lazy((parent) => {

              let expectedGrandParent = {
                id: 'JIM',
                name: 'Jim',
                meta: undefined,
                parent: undefined,
                [PROXY_KEY]: 'parent.meta',
                [recordTypeKey]: 'THINGS',
              }
              expect(parent.parent).toEqual(expectedGrandParent)
              expect(parent.parent).toHaveTheSameKeysAs(expectedGrandParent)

              let expectedParent = {
                testing: 'something',
                foo: undefined,
                parent: expectedGrandParent,
                [PROXY_KEY]: 'parent.foo',
                [LAZY_PROPS]: new Set(['foo']),
              }

              expect(parent).toEqual(expectedParent)
              expect(parent).toHaveTheSameKeysAs(expectedParent)

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
    const desc = Object.getOwnPropertyDescriptor(JIM, 'meta')

    expect(desc).toEqual({
      writable: false,
      configurable: true,
      enumerable: true,
      value: {
        foo: 'bar',
        'testing': 'something',
      },
    })
  })
})