import { describe, expect, it } from 'vitest'
import { LAZY_PROPS, trackLazyProp, untrackLazyProp } from '../../src/lazyProperties/trackLazyProps'

describe('trackLazyProps', () => {
  it('normal', () => {
    const target: any = {}

    trackLazyProp(target, 'foo')
    expect(target[LAZY_PROPS]).toEqual(new Set(['foo']))

    trackLazyProp(target, 'bar')
    expect(target[LAZY_PROPS]).toEqual(new Set(['foo', 'bar']))

    untrackLazyProp(target, 'foo')
    expect(target[LAZY_PROPS]).toEqual(new Set(['bar']))

    untrackLazyProp(target, 'bar')
    expect(target[LAZY_PROPS]).toEqual(undefined)
  })
})
