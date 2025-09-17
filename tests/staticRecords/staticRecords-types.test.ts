import { describe, expectTypeOf, it } from 'vitest'
import { type HasId, type HasRecordKey, recordTypeKey, staticRecords, type WithRecordType } from '../../src'

describe('staticRecords() types', async () => {
  describe('GENERICS: Item', async () => {
    type Vehicle = {
      readonly id: string,
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
        readonly id: string,
        readonly [recordTypeKey]: string,
        name: string,
      }>()
    })

    it('definer return type', async () => {
      type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
      expectTypeOf<InputReturnValue>().toMatchObjectType<{
        readonly id?: never,
        readonly [recordTypeKey]?: never
        name: string,
      }>()
    })
  })

  describe('GENERICS: Item, ProtoItem', async () => {
    type Vehicle = {
      readonly id: string,
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
        readonly id: string,
        readonly [recordTypeKey]: string,
        name: string,
        foo: string,
      }>()
    })

    it('definer return type', async () => {
      type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
      expectTypeOf<InputReturnValue>().toMatchObjectType<{
        readonly id?: never,
        readonly [recordTypeKey]?: never,
        foo?: never
        name: string,
      }>()
    })
  })

  describe('GENERICS: Item, ProtoItem, Input', async () => {
    type Vehicle = {
      readonly id: string,
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
        readonly id: string,
        readonly [recordTypeKey]: string,
        name: string,
        foo: string,
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