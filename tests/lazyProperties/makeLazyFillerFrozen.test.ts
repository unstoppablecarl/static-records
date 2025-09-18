import { describe, expect, it } from 'vitest'
import { lazy, type Lazy, lazyTree, makeLazyFiller, recordTypeKey, staticRecords } from '../../src'
import { isProxy } from './_helpers/_helpers'
import { getLazyProps } from '../../src/lazyProperties/trackLazyProps'

describe('makeLazyFiller frozen', () => {
  type Driver = {
    id: string,
    name: string,
    carName: string,
    location: string,
  }

  type DriverInput = {
    name: string,
    age: number,
    carName: Lazy<string>
    location: Lazy<string>
  }

  const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
    filler: makeLazyFiller({ freeze: true }),
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
    }),
  )
  DRIVERS.lock()

  it('lazy property description', () => {
    const desc = Object.getOwnPropertyDescriptor(DAN, 'carName')
    expect(desc).to.include({
      configurable: true,
      enumerable: true,
    })
    expect(desc?.get).to.not.be.undefined
  })

  it('non-lazy property description', () => {
    const desc = Object.getOwnPropertyDescriptor(DAN, 'age')
    expect(desc).to.include({
      configurable: false,
      writable: false,
      enumerable: true,
    })
    expect(desc?.get).to.be.undefined
  })

  it('lifecycle', () => {
    expect(getLazyProps(DAN)).toEqual([
      'carName',
      'location',
    ])

    expect(DAN.carName).toEqual('Mustang')

    expect(getLazyProps(DAN)).toEqual([
      'location',
    ])

    expect(DAN.location).toEqual('Arizona')

    expect(getLazyProps(DAN)).toEqual(undefined)

    expect(DAN).toEqual({
      id: DAN.id,
      name: DAN.name,
      [recordTypeKey]: 'DRIVER',
      carName: 'Mustang',
      location: 'Arizona',
      age: 20,
    })

    const desc2 = Object.getOwnPropertyDescriptor(DAN, 'carName')
    expect(desc2).to.include({
      configurable: true,
      enumerable: true,
      writable: false,
    })
  })

  it('freezes object that do not have lazy resolvers', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller({ freeze: true }),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
        static: {
          foo: 'bar',
        },
        carName: lazy(() => {
          return 'Mustang'
        }),
      }),
    )
    DRIVERS.lock()
    expect(DAN.static).toBeFrozen(true)
    expect(DAN).toBeFrozen(false)

    const desc = Object.getOwnPropertyDescriptor(DAN, 'carName')

    expect(desc).toMatchObject({
      configurable: true,
      enumerable: true,
      set: undefined,
    })
    expect(desc?.get).not.toBe(undefined)
  })

  it('circular referenced static objects', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller({ freeze: true }),
    })

    const a: any = {
      name: 'a',
      ref: null,
    }
    const b: any = {
      name: 'b',
      ref: a,
    }
    b.ref = a

    const alpha: any = {
      name: 'alpha',
      meta: a,
    }

    const beta: any = {
      name: 'beta',
      ref: alpha,
      meta: b,
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
    expect(DAN.alpha).toBeFrozen(true)
    expect(DAN.beta).toBeFrozen(true)
    expect(DAN.alpha.a).toBeFrozen(true)
    expect(DAN.beta.b).toBeFrozen(true)
    expect(DAN.beta).toBeFrozen(true)
    expect(isProxy(DAN)).toBe(false)
  })

  it('circular referenced lazy objects', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller({ freeze: true }),
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
    expect(DAN).toBeFrozen(true)

    expect(DAN.alpha.sub1.ref).toBeFrozen(false)

    expect(DAN.beta.sub).toBeFrozen(true)
    expect(DAN.alpha.sub).toBeFrozen(true)
    expect(DAN.alpha.sub1).toBeFrozen(true)
    expect(DAN.alpha.sub2).toBeFrozen(true)
    expect(DAN.alpha.sub1.ref).toBeFrozen(false)
    expect(DAN.alpha.sub2.ref).toBeFrozen(false)

    expect(isProxy(DAN)).toBe(false)
  })

  it('correctly locks objects', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller({ freeze: true }),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        alpha: {
          out: {
            ref: 'a',
          },
        },
        beta: {
          out: {
            ref: lazy(() => 'b'),
          },
        },
      }),
    )

    DRIVERS.lock()

    expect(DAN.alpha).toBeFrozen(true)
    expect(DAN.alpha.out).toBeFrozen(true)
    expect(DAN).toBeFrozen(true)
    expect(DAN.beta.out).toBeFrozen(false)
    expect(DAN.beta.out.ref).toBe('b')
  })

  it('does not freeze objects with lazy resolvers', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller({ freeze: true, lazyTree: true }),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        object: {
          ref: 'a',
          child: {
            sub: 'a',
          },
        },
        lazyTest: {
          out: lazy(() => 'a'),
          foo: 'bar',
        },
        lazyTreeTest: {
          out: lazyTree(() => 'b'),
          foo: 'bar',
        },
      }),
    )
    DRIVERS.lock()

    expect(DAN).toBeFrozen(true)
    expect(DAN.object).toBeFrozen(true)
    expect(DAN.object.child).toBeFrozen(true)

    expect(DAN.lazyTest).toBeFrozen(false)
    expect(DAN.lazyTest.out).toBe('a')

    expect(DAN.lazyTreeTest).toBeFrozen(false)
    expect(DAN.lazyTreeTest.out).toBe('b')
  })

  it('does not freeze when disabled by default', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller(),
    })

    notFrozenTest(DRIVERS)
  })

  it('does not lock when disabled', () => {
    const DRIVERS = staticRecords('DRIVER', {
      filler: makeLazyFiller({ freeze: false }),
    })

    notFrozenTest(DRIVERS)
  })
})

function notFrozenTest(DRIVERS: any) {
  const DAN: any = DRIVERS.define(
    'DAN',
    () => ({
      alpha: {
        out: {
          ref: 'a',
        },
      },
      beta: {
        out: {
          ref: lazy(() => 'b'),
        },
      },
    }),
  )

  DRIVERS.lock()

  expect(DAN.alpha).toBeFrozen(false)
  expect(DAN.alpha.out).toBeFrozen(false)
  expect(DAN).toBeFrozen(false)
  expect(DAN.beta.out).toBeFrozen(false)
  expect(DAN.beta.out.ref).toBe('b')
}