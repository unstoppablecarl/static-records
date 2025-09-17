import { describe, expect, it } from 'vitest'
import { frozenFiller, staticRecords } from '../../src'

function makeExample() {
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
    filler: frozenFiller,
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

  return { DAN, LISA, DRIVERS }
}

describe('frozenFiller', () => {
  it('objects are frozen', () => {
    const { DAN, LISA } = makeExample()

    expect(DAN).toBeFrozen(true)
    expect(DAN.meta).toBeFrozen(true)
    expect(DAN.meta.foo).toBeFrozen(true)
    expect(LISA).toBeFrozen(true)
    expect(LISA.backup).toBeFrozen(true)
    expect(LISA.backup).toBe(DAN)
  })
})
