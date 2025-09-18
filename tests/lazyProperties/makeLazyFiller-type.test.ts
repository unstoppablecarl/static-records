import { describe, expect, it } from 'vitest'
import { recordTypeKey, staticRecords } from '../../src'
import { makeLazyFiller } from '../../src/lazyProperties/makeLazyFiller'
import { lazy, type Lazy, lazyTree } from '../../src/lazyProperties'

describe('lazyFiller types', () => {
  it('mixed lazy types', () => {
    type Vehicle = {
      readonly id: string,
      readonly name: string,
    }

    type VehicleInput = {
      name: Lazy<string>,
    }

    const DRIVERS = staticRecords<Vehicle, never, VehicleInput>('DRIVER', {
      filler: makeLazyFiller({ lazyTree: true }),
    })

    const DAN: any = DRIVERS.define(
      'DAN',
      () => ({
        name: 'Dan',
      }),
    )

    const SAM: any = DRIVERS.define(
      'SAM',
      () => ({
        name: lazy(() => 'Sam'),
      }),
    )

    const JIM: any = DRIVERS.define(
      'JIM',
      () => ({
        name: lazyTree(() => 'Jim'),
      }),
    )

    DRIVERS.lock()

    expect(DAN).toEqual({
      id: 'DAN',
      name: 'Dan',
      [recordTypeKey]: 'DRIVER',
    })

    expect(SAM).toEqual({
      id: 'SAM',
      name: 'Sam',
      [recordTypeKey]: 'DRIVER',
    })

    expect(JIM).toEqual({
      id: 'JIM',
      name: 'Jim',
      [recordTypeKey]: 'DRIVER',
    })
  })
})
