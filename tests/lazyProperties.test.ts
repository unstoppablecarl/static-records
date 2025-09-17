import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  hasLazyResolvers,
  type HasParent,
  isAnyLazyResolver,
  lazy,
  LAZY_RESOLVER,
  LazyResolverType,
  lazyTree,
} from '../src'

describe('lazyProperties', async () => {
  it('lazy()', async () => {
    const target = lazy(() => ({
      foo: 'bar',
    }))
    expect(target[LAZY_RESOLVER]).toEqual(LazyResolverType.DEFAULT)
  })

  it('lazyTree()', async () => {
    const target = lazyTree(() => ({
      foo: 'bar',
    }))
    expect(target[LAZY_RESOLVER]).toEqual(LazyResolverType.TREE)
  })

  it('isAnyLazyResolver()', async () => {
    const target = lazy(() => ({
      foo: 'bar',
    }))
    expect(isAnyLazyResolver(target)).toEqual(true)
    expect(isAnyLazyResolver({ foo: 'bar' })).toEqual(false)

    const values = [
      null,
      undefined,
      false,
      0,
      '',
      {},
      () => {
      },
    ]

    values.forEach((v) => {
      expect(isAnyLazyResolver(v)).toBe(false)
    })
  })

  it('hasLazyResolvers()', async () => {
    const target = {
      name: 'jim',
      extra: lazy(() => ({
        foo: 'bar',
      })),
    }
    expect(isAnyLazyResolver(target.extra)).toEqual(true)
    expect(hasLazyResolvers(target)).toEqual(true)
    expect(hasLazyResolvers({ foo: 'bar' })).toEqual(false)
  })

  describe('lazy() type checks', async () => {
    it('lazy() inferred from resolver', async () => {
      const target = lazyTree((parent, root) => {

        expectTypeOf(parent).toEqualTypeOf<HasParent | undefined>()
        expectTypeOf(root).toEqualTypeOf<HasParent | undefined>()

        return 'foo'
      })

      // expectTypeOf(target).toEqualTypeOf<LazyResolver<string>>()
    })

    it('lazy() provided generics', async () => {
      type Input = {
        inputName: string
      }
      type Parent = HasParent & {
        parentName: string,
      }
      type Root = HasParent & {
        rootName: string,
      }

      const target = lazyTree<Input, Parent, Root>((parent, root) => {
        expectTypeOf(parent).toEqualTypeOf<Parent>()
        expectTypeOf(root).toEqualTypeOf<Root>()

        return {
          inputName: 'foo',
        }
      })

      expectTypeOf<ReturnType<typeof target>>().toEqualTypeOf<Input>()
    })
  })
})