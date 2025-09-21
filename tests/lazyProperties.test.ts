import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  hasAnyLazyResolvers,
  type HasParent,
  isAnyLazyResolver,
  isLazyDefaultResolver,
  isLazyTreeResolver,
  lazy,
  LAZY_RESOLVER,
  LazyResolverType,
  lazyTree,
  makeLazyFiller,
  recordTypeKey,
  type RootBase,
  staticRecords,
  type To,
} from '../src'
import type { Rec } from '../src/type-util'
import { PROXY_KEY } from '../src/lazyProperties/proxy'
import { LAZY_PROPS } from '../src/lazyProperties/trackLazyProps'

const invalidValues = [
  null,
  undefined,
  false,
  0,
  '',
  {},
  () => {
  },
]

describe('lazyProperties', () => {
  it('lazy()', () => {
    const target = lazy(() => ({
      foo: 'bar',
    }))

    // @ts-expect-error
    expect(target[LAZY_RESOLVER]).toEqual(LazyResolverType.DEFAULT)
  })

  it('isLazyDefaultResolver()', () => {
    const def = lazy(() => ({
      foo: 'bar',
    }))
    const tree = lazyTree(() => ({
      foo: 'bar',
    }))
    expect(isLazyDefaultResolver(def)).toBe(true)
    expect(isLazyDefaultResolver(tree)).toBe(false)

    invalidValues.forEach((v) => {
      expect(isLazyDefaultResolver(v)).toBe(false)
    })
  })

  it('lazyTree()', () => {
    const target = lazyTree(() => ({
      foo: 'bar',
    }))
    // @ts-expect-error
    expect(target[LAZY_RESOLVER]).toEqual(LazyResolverType.TREE)
  })

  it('isLazyTreeResolver()', () => {
    const def = lazy(() => ({
      foo: 'bar',
    }))
    const tree = lazyTree(() => ({
      foo: 'bar',
    }))
    expect(isLazyTreeResolver(def)).toBe(false)
    expect(isLazyTreeResolver(tree)).toBe(true)

    invalidValues.forEach((v) => {
      expect(isLazyTreeResolver(v)).toBe(false)
    })
  })

  it('isAnyLazyResolver()', () => {
    const def = lazy(() => ({
      foo: 'bar',
    }))
    const tree = lazyTree(() => ({
      foo: 'bar',
    }))
    expect(isAnyLazyResolver(def)).toEqual(true)
    expect(isAnyLazyResolver(tree)).toEqual(true)
    expect(isAnyLazyResolver({ foo: 'bar' })).toEqual(false)
    expect(isAnyLazyResolver(99)).toEqual(false)

    invalidValues.forEach((v) => {
      expect(isAnyLazyResolver(v)).toBe(false)
    })
  })

  it('hasAnyLazyResolvers()', () => {
    const target = {
      name: 'jim',
      extra: lazy(() => ({
        foo: 'bar',
      })),
    }
    expect(hasAnyLazyResolvers(target)).toEqual(true)
    expect(hasAnyLazyResolvers({ foo: 'bar' })).toEqual(false)
  })

  describe('lazy() type checks', () => {
    it('lazy() inferred from resolver', () => {
      const target = lazy(() => {
        return 'foo'
      })

      expectTypeOf(target).toEqualTypeOf<string>()
    })

    it('lazy() provided generics', () => {
      type Input = {
        inputName: string
      }

      const target = lazy<Input>(() => {
        return {
          inputName: 'foo',
        }
      })

      expectTypeOf<typeof target>().toEqualTypeOf<Input>()
    })
  })

  describe('lazyTree() ParentKey type checks', () => {
    it('lazyTree() no generics', () => {
      type Person = {
        id: string,
        name: string,
        a: {
          deep: {
            id: string,
            property: {
              value: string
            }
          }
        }
      }
      const customParentKey = '__parent__'

      const PEOPLE = staticRecords<Person>('Person', {
        filler: makeLazyFiller({
          lazyTree: true,
          parentKey: customParentKey,
        }),
      })

      const DAN = PEOPLE.define(
        'DAN',
        () => ({
          name: 'Dan',
          a: {
            deep: {
              id: 'test-id',
              // test default lazyTree generics
              property: lazyTree<
                Person['a']['deep']['property'],
                Person['a']['deep'],
                Person,
                typeof customParentKey
              >((parent) => {
                expect(parent).toEqual({
                  __parent__: {
                    __parent__: {
                      __parent__: undefined,
                      a: undefined,
                      id: 'DAN',
                      name: 'Dan',
                      [PROXY_KEY]: 'parent.a',
                      [recordTypeKey]: 'Person',
                    },
                    deep: undefined,
                    [PROXY_KEY]: 'parent.deep',
                  },
                  id: 'test-id',
                  property: undefined,
                  [PROXY_KEY]: 'parent.property',
                  [LAZY_PROPS]: new Set(['property']),
                })

                return {
                  value: 'bar',
                }
              }),
            },
          },
        }),
      )

      const SAM = PEOPLE.define(
        'Sam',
        () => ({
          name: 'Sam',
          a: {
            id: 'a-id',
            deep: {
              id: 'deep-id',
              // test overload lazyTree generics
              property: lazyTree<To<Person, 'a.deep.property', typeof customParentKey>>((parent) => {
                expect(parent).toEqual({
                  __parent__: {
                    __parent__: {
                      __parent__: undefined,
                      a: undefined,
                      id: 'Sam',
                      name: 'Sam',
                      [PROXY_KEY]: 'parent.a',
                      [recordTypeKey]: 'Person',
                    },
                    deep: undefined,
                    id: 'a-id',
                    [PROXY_KEY]: 'parent.deep',
                  },
                  id: 'deep-id',
                  property: undefined,
                  [PROXY_KEY]: 'parent.property',
                  [LAZY_PROPS]: new Set(['property']),
                })

                return {
                  value: 'bar',
                }
              }),
            },
          },
        }),
      )
      PEOPLE.lock()
      expect(DAN.a.deep.property.value).toEqual('bar')
      expect(SAM.a.deep.property.value).toEqual('bar')
    })
  })

  describe('lazyTree() type checks', () => {
    it('lazyTree() no generics', () => {
      const target = lazyTree((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<HasParent<Rec, 'parent'> | undefined>()
        expectTypeOf(root).toEqualTypeOf<RootBase>()

        return 'foo'
      })

      expectTypeOf(target).toEqualTypeOf<string>()
    })

    it('lazyTree<T>()', () => {
      type T = {
        foo: string
      }

      const target = lazyTree<T>((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<HasParent | undefined>()
        expectTypeOf(root).toEqualTypeOf<RootBase>()

        return {
          foo: 'bar',
        }
      })

      expectTypeOf(target).toEqualTypeOf<T>()
    })

    it('lazyTree<T, Parent>()', () => {
      type T = {
        foo: string
      }

      type Parent = HasParent<{
        parentName: string
      }>

      const target = lazyTree<T, Parent>((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<Parent>()
        expectTypeOf(root).toEqualTypeOf<RootBase>()

        return {
          foo: 'bar',
        }
      })

      expectTypeOf(target).toEqualTypeOf<T>()
    })

    it('lazyTree() provided generics', () => {
      type Input = {
        inputName: string
      }
      type Parent = HasParent<{
        parentName: string,
      }>
      type Root = RootBase & {
        id: string,
        rootName: string,
      }

      const target = lazyTree<Input, Parent, Root>((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<Parent>()
        expectTypeOf(root).toEqualTypeOf<Root>()

        return {
          inputName: 'foo',
        }
      })

      expectTypeOf<typeof target>().toEqualTypeOf<Input>()
    })
  })
})