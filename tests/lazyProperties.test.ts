import { describe, expect, it } from 'vitest'
import { hasLazyResolvers, isLazyResolver, lazy, LAZY_RESOLVER } from '../src'

describe('lazyProperties', async () => {
  it('lazy()', async () => {
    const target = lazy(() => ({
      foo: 'bar',
    }))

    // @ts-expect-error
    expect(target[LAZY_RESOLVER]).toEqual(true)
  })

  it('isLazyResolver()', async () => {
    const target = lazy(() => ({
      foo: 'bar',
    }))
    expect(isLazyResolver(target)).toEqual(true)
    expect(isLazyResolver({ foo: 'bar' })).toEqual(false)
  })

  it('hasLazyResolvers()', async () => {
    const target = {
      name: 'jim',
      extra: lazy(() => ({
        foo: 'bar',
      }))
    }
    expect(isLazyResolver(target.extra)).toEqual(true)
    expect(hasLazyResolvers(target)).toEqual(true)
    expect(hasLazyResolvers({ foo: 'bar' })).toEqual(false)
  })
})