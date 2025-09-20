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
  type RootBase,
} from '../src'

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

describe('lazyProperties', async () => {
  it('lazy()', async () => {
    const target = lazy(() => ({
      foo: 'bar',
    }))

    // @ts-expect-error
    expect(target[LAZY_RESOLVER]).toEqual(LazyResolverType.DEFAULT)
  })

  it('isLazyDefaultResolver()', async () => {
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

  it('lazyTree()', async () => {
    const target = lazyTree(() => ({
      foo: 'bar',
    }))
    // @ts-expect-error
    expect(target[LAZY_RESOLVER]).toEqual(LazyResolverType.TREE)
  })

  it('isLazyTreeResolver()', async () => {
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

  it('isAnyLazyResolver()', async () => {
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

  it('hasAnyLazyResolvers()', async () => {
    const target = {
      name: 'jim',
      extra: lazy(() => ({
        foo: 'bar',
      })),
    }
    expect(hasAnyLazyResolvers(target)).toEqual(true)
    expect(hasAnyLazyResolvers({ foo: 'bar' })).toEqual(false)
  })

  describe('lazy() type checks', async () => {
    it('lazy() inferred from resolver', async () => {
      const target = lazy(() => {
        return 'foo'
      })

      expectTypeOf(target).toEqualTypeOf<string>()
    })

    it('lazy() provided generics', async () => {
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

  describe('lazyTree() type checks', async () => {
    it('lazyTree() no generics', async () => {
      const target = lazyTree((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<HasParent | undefined>()
        expectTypeOf(root).toEqualTypeOf<RootBase>()

        return 'foo'
      })

      expectTypeOf(target).toEqualTypeOf<string>()
    })

    it('lazyTree<T>()', async () => {
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

    it('lazyTree<T, Parent>()', async () => {
      type T = {
        foo: string
      }

      type Parent = HasParent & {
        parentName: string
      }

      const target = lazyTree<T, Parent>((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<Parent>()
        expectTypeOf(root).toEqualTypeOf<RootBase>()

        return {
          foo: 'bar',
        }
      })

      expectTypeOf(target).toEqualTypeOf<T>()
    })

    it('lazyTree() provided generics', async () => {
      type Input = {
        inputName: string
      }
      type Parent = HasParent & {
        parentName: string,
      }
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