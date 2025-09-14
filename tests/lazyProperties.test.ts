import { describe, expect, it } from 'vitest'
import {
  hasLazyResolvers,
  isLazyResolver,
  lazy,
  LAZY_RESOLVER,
  lazyFiller,
  lazyFrozenFiller,
  staticRecords,
} from '../src'

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
      })),
    }
    expect(isLazyResolver(target.extra)).toEqual(true)
    expect(hasLazyResolvers(target)).toEqual(true)
    expect(hasLazyResolvers({ foo: 'bar' })).toEqual(false)
  })

  it('lazyFiller freezer exception', async () => {
    const R = staticRecords('Foo', {
      filler: lazyFiller,
    })

    R.define('A', () => ({
      foo: 'bar',
    }))

    expect(() => {
      R.lock()
    }).toThrowError(`When using filler: lazyFiller, option.freeze must be false`)
  })

  it('lazyFrozenFiller freezer exception', async () => {
    const R = staticRecords('Foo', {
      filler: lazyFrozenFiller,
    })

    R.define('A', () => ({
      foo: 'bar',
    }))

    expect(() => {
      R.lock()
    }).toThrowError(`When using filler: lazyFrozenFiller, option.freeze must be false`)
  })
})