import { describe, expectTypeOf, it } from 'vitest'
import { type HasId, type HasRecordKey, recordTypeKey, staticRecords, type WithRecordType } from '../../src'

describe('staticRecords() types', async () => {
  describe('GENERICS: Item', async () => {
    type Vehicle = {
      id: string,
      name: string,
    }
    const VEHICLES = staticRecords<Vehicle>('VEHICLE')
    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        name: 'Car',
      }),
    )
    VEHICLES.lock()

    it('Record type', async () => {
      expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
      expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

      expectTypeOf(CAR).toMatchObjectType<{
        id: string,
        name: string,
        [recordTypeKey]: string,
      }>()
    })

    it('definer return type', async () => {
      type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
      expectTypeOf<InputReturnValue>().toMatchObjectType<{
        name: string,
        id?: never,
        // [recordTypeKey]?: never
      }>()
    })
  })

  describe('GENERICS: Item, ProtoItem', async () => {
    type Vehicle = {
      id: string,
      name: string,
      foo: string,
    }

    type ProtoVehicle = HasId & HasRecordKey & {
      foo: string
    }

    const VEHICLES = staticRecords<Vehicle, ProtoVehicle>('VEHICLE', {
      creator(id, recordType) {
        return {
          id,
          [recordTypeKey]: recordType,
          foo: 'bar',
        }
      },
    })

    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        name: 'Car',
      }),
    )
    VEHICLES.lock()

    it('Record type', async () => {
      expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
      expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

      expectTypeOf(CAR).toMatchObjectType<{
        id: string,
        name: string,
        foo: string,
        [recordTypeKey]: string,
      }>()
    })

    it('definer return type', async () => {
      type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
      expectTypeOf<InputReturnValue>().toMatchObjectType<{
        name: string,
        id?: never,
        [recordTypeKey]?: never,
        foo?: never
      }>()
    })
  })

  describe('GENERICS: Item, ProtoItem, Input', async () => {
    type Vehicle = {
      id: string,
      name: string,
      foo: string,
    }

    type ProtoVehicle = HasId & HasRecordKey & {
      foo: string
    }

    type Input = {
      baseName: string
    }

    const VEHICLES = staticRecords<Vehicle, ProtoVehicle, Input>('VEHICLE', {
      creator(id, recordType) {
        return {
          id,
          [recordTypeKey]: recordType,
          foo: 'bar',
        }
      },
    })

    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        baseName: 'Car',
      }),
    )
    VEHICLES.lock()

    it('Record type', async () => {
      expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
      expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

      expectTypeOf(CAR).toMatchObjectType<{
        id: string,
        name: string,
        foo: string,
        [recordTypeKey]: string,
      }>()
    })

    it('definer return type', async () => {
      type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
      expectTypeOf<InputReturnValue>().toMatchObjectType<{
        baseName: string,
      }>()
    })
  })
})