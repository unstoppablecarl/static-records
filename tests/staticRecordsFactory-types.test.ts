import { describe, expectTypeOf, it } from 'vitest'
import {
  type DefaultProtoItem,
  type NeverProtoKeys,
  recordTypeKey,
  staticRecordsFactory,
  type WithRecordType,
} from '../src'

describe('staticTypeFactory() types', async () => {
  describe('staticRecordsFactory[] - makeStaticRecords[Vehicle]', async () => {
    type Vehicle = {
      id: string,
      name: string,
    }
    const makeStaticRecords = staticRecordsFactory()
    const VEHICLES = makeStaticRecords<Vehicle>('VEHICLE', {
      filler(item, input) {
        expectTypeOf(item).toEqualTypeOf<DefaultProtoItem>()
        expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<Vehicle, DefaultProtoItem>>()

        type expected = {
          id?: never
          [recordTypeKey]?: never,
          name: string,
        }

        expectTypeOf(input).toExtend<expected>()
        expectTypeOf(input).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()
      },
    })
    const CAR = VEHICLES.define(
      'CAR',
      () => ({
        name: 'Car',
      }),
    )
    VEHICLES.lock()

    it('Record Type', async () => {
      expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
      expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

      type expected = {
        id: string,
        [recordTypeKey]: string,
        name: string,
      }

      expectTypeOf(CAR).toExtend<expected>()
      expectTypeOf(CAR).toMatchObjectType<expected>()
      expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
    })

    it('definer return type', async () => {
      type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
      type expected = {
        id?: never,
        [recordTypeKey]?: never,
        name: string,
      }

      expectTypeOf<InputReturnValue>().toExtend<expected>()
      expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
      expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
    })
  })

  describe('staticRecordsFactory[BaseItem]', () => {
    describe('--makeStaticRecords[Vehicle]', async () => {
      type BaseItem = {
        id: string,
        meta: string,
      }

      type Vehicle = BaseItem & {
        name: string,
      }
      const makeStaticRecords = staticRecordsFactory<BaseItem>()
      const VEHICLES = makeStaticRecords<Vehicle>('VEHICLE')
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          meta: 'foo',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          name: string,
          meta: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>

        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          name: string,
          meta: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
    describe('--makeStaticRecords[Vehicle, VehicleProto]', async () => {
      type BaseItem = {
        id: string,
        meta: string,
      }

      type Vehicle = BaseItem & VehicleProto & {
        name: string,
      }

      type VehicleProto = DefaultProtoItem & {
        vehicleProto: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem>()
      const VEHICLES = makeStaticRecords<Vehicle, VehicleProto>('VEHICLE', {
        creator(id, recordType) {
          return {
            vehicleProto: `vehicle-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          meta: 'foo',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          vehicleProto: string,
          name: string,
          meta: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>

        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          vehicleProto?: never,
          name: string,
          meta: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })

    describe('--makeStaticRecords[Vehicle, VehicleProto, VehicleInput]', async () => {
      type BaseItem = {
        id: string,
        meta: string,
      }

      type Vehicle = BaseItem & VehicleProto & {
        name: string,
      }

      type VehicleProto = DefaultProtoItem & {
        vehicleProto: string,
      }

      type VehicleInput = {
        name: string,
        meta: string,
        vehicleInput: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem>()
      const VEHICLES = makeStaticRecords<Vehicle, VehicleProto, VehicleInput>('VEHICLE', {
        creator(id, recordType) {
          return {
            vehicleProto: `vehicle-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
        filler(item, input) {
          expectTypeOf(item).toEqualTypeOf<VehicleProto>()
          expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<VehicleInput, VehicleProto>>()

          type expected = {
            id?: never,
            [recordTypeKey]?: never,
            vehicleProto?: never,
            vehicleInput: string,
            meta: string,
            name: string,
          }

          expectTypeOf(input).toExtend<expected>()
          expectTypeOf(input).toMatchObjectType<expected>()
          expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

          const { vehicleInput } = input
          const inputResult: NeverProtoKeys<Vehicle, VehicleProto> = {
            name: vehicleInput,
            meta: 'foo',
          }

          Object.assign(item, inputResult)
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          meta: 'foo',
          vehicleInput: 'input-car',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          vehicleProto: string,
          name: string,
          meta: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>

        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          vehicleProto?: never,
          name: string,
          meta: string,
          vehicleInput: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
  })

  describe('staticRecordsFactory[BaseItem, BaseProtoItem]', () => {
    describe('--makeStaticRecords[Vehicle]', async () => {
      type BaseProtoItem = DefaultProtoItem & {
        uid: string,
      }

      type BaseItem = BaseProtoItem & {
        id: string,
        meta: string,
      }

      type Vehicle = BaseItem & {
        name: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem>({
        creator(id, recordType) {
          return {
            uid: `${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })

      const VEHICLES = makeStaticRecords<Vehicle>('VEHICLE')
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          meta: 'something',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          uid: string,
          name: string,
          meta: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          uid?: never,
          name: string,
          meta: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
    describe('--makeStaticRecords[Vehicle, VehicleProto]', async () => {
      type BaseProtoItem = DefaultProtoItem & {
        uid: string,
      }

      type BaseItem = BaseProtoItem & {
        id: string,
        meta: string,
      }

      type Vehicle = BaseItem & VehicleProto & {
        name: string,
      }

      type VehicleProto = BaseProtoItem & {
        vehicleProto: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem>({
        creator(id, recordType) {
          return {
            uid: `${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })

      const VEHICLES = makeStaticRecords<Vehicle, VehicleProto>('VEHICLE', {
        creator(id, recordType) {
          return {
            uid: `${recordType}-${id}`,
            vehicleProto: `vehicle-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          meta: 'something',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          uid: string,
          vehicleProto: string,
          name: string,
          meta: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          uid?: never,
          vehicleProto?: never,
          name: string,
          meta: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })

    describe('--makeStaticRecords[Vehicle, VehicleProto, VehicleInput]', async () => {
      type BaseProtoItem = DefaultProtoItem & {
        uid: string,
      }

      type BaseItem = BaseProtoItem & {
        id: string,
        meta: string,
      }

      type Vehicle = BaseItem & VehicleProto & {
        name: string,
      }

      type VehicleProto = BaseProtoItem & {
        vehicleProto: string,
      }

      type VehicleInput = {
        vehicleInput: string,
        name: string,
        meta: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem>({
        creator(id, recordType) {
          return {
            uid: `${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })

      const VEHICLES = makeStaticRecords<Vehicle, VehicleProto, VehicleInput>('VEHICLE', {
        creator(id, recordType) {
          return {
            uid: `${recordType}-${id}`,
            vehicleProto: `vehicle-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
        filler(item, input) {
          expectTypeOf(item).toEqualTypeOf<VehicleProto>()
          expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<VehicleInput, VehicleProto>>()

          type expected = {
            id?: never,
            [recordTypeKey]?: never,
            uid?: never,
            vehicleProto?: never,
            vehicleInput: string,
            name: string,
            meta: string,
          }

          expectTypeOf(input).toExtend<expected>()
          expectTypeOf(input).toMatchObjectType<expected>()
          expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

          const { vehicleInput } = input
          const inputResult: NeverProtoKeys<Vehicle, VehicleProto> = {
            name: vehicleInput,
            meta: 'foo',
          }

          Object.assign(item, inputResult)
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          meta: 'foo',
          vehicleInput: 'input-car',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          uid: string,
          vehicleProto: string,
          name: string,
          meta: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          uid?: never,
          vehicleProto?: never,
          name: string,
          meta: string,
          vehicleInput: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
  })
  describe('staticRecordsFactory[BaseItem, BaseProtoItem, BaseInput]', () => {
    describe('--makeStaticRecords[Vehicle]', async () => {
      type BaseProtoItem = DefaultProtoItem & {
        baseProto: string,
      }

      type BaseItem = BaseProtoItem & {
        baseItem: string,
      }

      type BaseInput = {
        name: string,
        baseInputOnly: string,
        baseItem: string,
      }

      type Vehicle = BaseItem & {
        name: string,
        vehicleOnly: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem, BaseInput>({
        creator(id, recordType) {
          return {
            baseProto: `base-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })

      const VEHICLES = makeStaticRecords<Vehicle>('VEHICLE', {
        filler(item, input) {
          expectTypeOf(item).toEqualTypeOf<BaseProtoItem>()
          type Target = BaseInput & Omit<Vehicle, keyof BaseProtoItem>
          expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<Target, BaseProtoItem>>()

          type expected = {
            id?: never
            [recordTypeKey]?: never,
            baseProto?: never,
            baseInputOnly: string,
            name: string,
            baseItem: string,
            vehicleOnly: string,
          }

          expectTypeOf(input).toExtend<expected>()
          expectTypeOf(input).toMatchObjectType<expected>()
          expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

          const {
            baseInputOnly,
          } = input

          const inputResult: NeverProtoKeys<Vehicle, BaseProtoItem> = {
            baseItem: 'whatever',
            name: 'foo',
            vehicleOnly: baseInputOnly,
          }

          Object.assign(item, inputResult)
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          name: 'Car',
          baseItem: 'something',
          baseInputOnly: 'asd',
          vehicleOnly: 'some',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          baseProto: string,
          baseItem: string,
          name: string,
          vehicleOnly: string
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
        type expected = {
          id?: never
          [recordTypeKey]?: never,
          baseProto?: never,
          baseInputOnly: string,
          name: string,
          baseItem: string,
          vehicleOnly: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
    describe('--makeStaticRecords[Vehicle, VehicleProto]', async () => {
      type BaseProtoItem = DefaultProtoItem & {
        baseProto: string,
      }

      type BaseItem = BaseProtoItem & {
        baseItem: string,
      }

      type BaseInput = {
        baseItem: string,
        baseInputOnly: string,
      }

      type Vehicle = BaseItem & VehicleProto & {
        vehicleOnly: string,
      }

      type VehicleProto = BaseProtoItem & {
        vehicleProto: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem, BaseInput>({
        creator(id, recordType) {
          return {
            baseProto: `base-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })

      const VEHICLES = makeStaticRecords<Vehicle, VehicleProto>('VEHICLE', {
        creator(id, recordType) {
          return {
            baseProto: `base-proto-${recordType}-${id}`,
            vehicleProto: `vehicle-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
        filler(item, input) {
          expectTypeOf(item).toEqualTypeOf<VehicleProto>()
          type Target = BaseInput & Omit<Vehicle, keyof VehicleProto>
          expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<Target, VehicleProto>>()

          type expected = {
            id?: never
            [recordTypeKey]?: never,
            baseProto?: never,
            vehicleProto?: never,
            baseInputOnly: string,
            vehicleOnly: string,
            baseItem: string,
          }

          expectTypeOf(input).toExtend<expected>()
          expectTypeOf(input).toMatchObjectType<expected>()
          expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

          const {
            baseInputOnly,
          } = input

          const inputResult: NeverProtoKeys<Vehicle, VehicleProto> = {
            baseItem: 'whatever',
            vehicleOnly: baseInputOnly,
          }

          Object.assign(item, inputResult)
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          baseItem: 'something',
          baseInputValue: 'whatever',
          vehicleOnly: 'Car',
          baseInputOnly: 'something',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          baseProto: string,
          vehicleProto: string,
          baseItem: string,
          vehicleOnly: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
        type expected = {
          id?: never,
          [recordTypeKey]?: never,
          baseProto?: never,
          vehicleProto?: never,
          baseInputOnly: string,
          baseItem: string,
          // baseInputValue: string,
          vehicleOnly: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
    describe('--makeStaticRecords[Vehicle, BaseProtoItem, VehicleInput]', async () => {
      type BaseProtoItem = DefaultProtoItem & {
        baseProto: string,
      }

      type BaseItem = BaseProtoItem & {
        baseItem: string,
        baseInputValue: string
      }

      type BaseInput = {
        baseInputOnly: string
      }

      type Vehicle = BaseItem & {
        vehicleOnly: string,
      }

      type VehicleProto = BaseProtoItem & {
        vehicleProto: string,
      }

      type VehicleInput = BaseInput & {
        vehicleInput: string,
      }

      const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem, BaseInput>({
        creator(id, recordType) {
          return {
            baseProto: `base-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
      })

      const VEHICLES = makeStaticRecords<Vehicle, VehicleProto, VehicleInput>('VEHICLE', {
        creator(id, recordType) {
          return {
            baseProto: `base-proto-${recordType}-${id}`,
            vehicleProto: `vehicle-proto-${recordType}-${id}`,
            [recordTypeKey]: recordType,
            id,
          }
        },
        filler(item, input) {
          expectTypeOf(item).toEqualTypeOf<VehicleProto>()
          expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<VehicleInput, VehicleProto>>()

          type expected = {
            id?: never
            [recordTypeKey]?: never,
            baseProto?: never,
            vehicleProto?: never,
            baseInputOnly: string,
            vehicleInput: string,
          }

          expectTypeOf(input).toExtend<expected>()
          expectTypeOf(input).toMatchObjectType<expected>()

          expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

          const {
            vehicleInput,
            baseInputOnly,
          } = input

          const inputResult: NeverProtoKeys<Vehicle, BaseProtoItem> = {
            baseItem: 'whatever',
            vehicleOnly: vehicleInput + '-added',
            baseInputValue: baseInputOnly,
          }

          Object.assign(item, inputResult)
        },
      })
      const CAR = VEHICLES.define(
        'CAR',
        () => ({
          baseItem: 'something',
          baseInputOnly: 'whatever',
          vehicleInput: 'Car',
        }),
      )
      VEHICLES.lock()

      it('Record Type', async () => {
        expectTypeOf(CAR).toEqualTypeOf<WithRecordType<Vehicle>>()
        expectTypeOf(CAR as Vehicle).toEqualTypeOf<Vehicle>()

        type expected = {
          id: string,
          [recordTypeKey]: string,
          baseProto: string,
          baseItem: string,
          baseInputValue: string,
          vehicleOnly: string,
        }

        expectTypeOf(CAR).toExtend<expected>()
        expectTypeOf(CAR).toMatchObjectType<expected>()
        expectTypeOf(CAR).branded.toEqualTypeOf<expected>()

        expectTypeOf<keyof typeof CAR>().toEqualTypeOf<keyof expected>()
      })

      it('definer return type', async () => {
        type InputReturnValue = ReturnType<Parameters<typeof VEHICLES.define>[1]>
        type expected = {
          id?: never
          [recordTypeKey]?: never,
          baseProto?: never,
          vehicleProto?: never,
          baseInputOnly: string,
          vehicleInput: string,
        }

        expectTypeOf<InputReturnValue>().toExtend<expected>()
        expectTypeOf<InputReturnValue>().toMatchObjectType<expected>()
        expectTypeOf<keyof InputReturnValue>().toEqualTypeOf<keyof expected>()
      })
    })
  })
})