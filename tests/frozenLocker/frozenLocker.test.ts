import { describe, expect, it } from 'vitest'
import { frozenLocker, recordTypeKey, staticRecords } from '../../src'

describe('frozenLocker', () => {
  type Driver = {
    id: string,
    name: string,
    meta: {
      foo: {
        some: string
      }
    },
    backup?: Driver,
  }

  type DriverInput = {
    name: string,
    meta: {
      foo: {
        some: string
      }
    },
    backup?: Driver,
  }

  const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
    locker: frozenLocker,
  })

  const DAN = DRIVERS.define(
    'DAN',
    () => ({
      name: 'Dan',
      meta: {
        foo: {
          some: 'thing',
        },
      },
    }),
  )

  const LISA = DRIVERS.define(
    'LISA',
    () => ({
      name: 'Lisa',
      meta: {
        foo: {
          some: 'thing',
        },
      },
      backup: DAN,
    }),
  )

  DRIVERS.lock()

  it('objects are frozen', () => {

    expect(DAN).toEqual({
      id: 'DAN',
      name: 'Dan',
      meta: {
        foo: {
          some: 'thing',
        },
      },
      [recordTypeKey]: 'DRIVER',
    })

    expect(LISA).toEqual({
      id: 'LISA',
      name: 'Lisa',
      meta: {
        foo: {
          some: 'thing',
        },
      },
      backup: DAN,
      [recordTypeKey]: 'DRIVER',
    })

    expect(DAN).toBeFrozen(true)
    expect(DAN.meta).toBeFrozen(true)
    expect(DAN.meta.foo).toBeFrozen(true)
    expect(LISA).toBeFrozen(true)
    expect(LISA.backup).toBeFrozen(true)
    expect(LISA.backup).toBe(DAN)
  })
})
