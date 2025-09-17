import { describe, expect, it, vi } from 'vitest'
import { getLazyProps, LAZY_PROPS, trackLazyProp, untrackLazyProp } from '../../src/lazyProperties/trackLazyProps'
import { lazy, makeLazyFiller, recordTypeKey, staticRecords } from '../../src'

describe('trackLazyProps', () => {
  it('normal', () => {
    const target: any = {}

    trackLazyProp(target, 'foo')
    expect(target[LAZY_PROPS]).toEqual(new Set(['foo']))

    trackLazyProp(target, 'bar')
    expect(target[LAZY_PROPS]).toEqual(new Set(['foo', 'bar']))

    expect(getLazyProps(target)).toEqual(['foo', 'bar'])

    untrackLazyProp(target, 'foo')
    expect(target[LAZY_PROPS]).toEqual(new Set(['bar']))
    expect(getLazyProps(target)).toEqual(['bar'])

    untrackLazyProp(target, 'bar')
    expect(target[LAZY_PROPS]).toEqual(undefined)
    expect(getLazyProps(target)).toEqual(undefined)
  })

  it('tracking disabled in PRODUCTION', () => {
    vi.stubGlobal('__DEV__', false)

    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller(),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        carName: lazy(() => {
          return 'Mustang'
        }),
        location: lazy(() => {
          return 'Arizona'
        }),
      }),
    )
    DRIVERS.lock()
    expect(LAZY_PROPS in DAN).toBe(false)
    expect(getLazyProps(DAN)).toEqual(undefined)
    expect(DAN.carName).toEqual('Mustang')
    expect(DAN.location).toEqual('Arizona')

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Mustang',
      location: 'Arizona',
    })
  })
})
