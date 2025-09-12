import { describe, expectTypeOf, it } from 'vitest'
import {
  type DefaultProtoItem,
  type IfNever,
  type MakeOptionsInput,
  type NeverProtoKeys,
  recordTypeKey,
  staticRecordsFactory,
} from '../src'

describe('staticTypeFactory() options types', async () => {
  it('staticRecordsFactory[BaseItem]', async () => {
    type BaseItem = {
      id: string,
      baseItem: string,
    }

    staticRecordsFactory<BaseItem>({
      creator(id, recordType) {
        expectTypeOf(id).toEqualTypeOf<string>()
        expectTypeOf(recordType).toEqualTypeOf<string>()

        return {
          [recordTypeKey]: recordType,
          id,
        }
      },
      filler(item, input) {
        expectTypeOf(item).toEqualTypeOf<DefaultProtoItem>()
        expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<BaseItem, DefaultProtoItem>>()

        type expected = {
          id?: never
          [recordTypeKey]?: never,
          baseItem: string,
        }

        expectTypeOf(input).toExtend<expected>()
        expectTypeOf(input).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

        Object.assign(item, input)
      },
    })
  })

  it('staticRecordsFactory[BaseItem, BaseProtoItem]', async () => {
    type BaseProtoItem = DefaultProtoItem & {
      baseProto: string,
    }

    type BaseItem = BaseProtoItem & {
      baseItem: string,
      baseInputValue: string
    }

    staticRecordsFactory<BaseItem, BaseProtoItem>({
      creator(id, recordType) {
        expectTypeOf(id).toEqualTypeOf<string>()
        expectTypeOf(recordType).toEqualTypeOf<string>()

        return {
          baseProto: `base-proto-${recordType}-${id}`,
          [recordTypeKey]: recordType,
          id,
        }
      },
      filler(item, input) {
        expectTypeOf(item).toEqualTypeOf<BaseProtoItem>()
        expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<BaseItem, BaseProtoItem>>()

        type expected = {
          id?: never
          [recordTypeKey]?: never,
          baseProto?: never,
          baseItem: string,
          baseInputValue: string,
        }

        expectTypeOf(input).toExtend<expected>()
        expectTypeOf(input).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()

        Object.assign(item, input)
      },
    })
  })

  it('staticRecordsFactory[BaseItem, BaseProtoItem, BaseInput]', async () => {
    type BaseProtoItem = DefaultProtoItem & {
      baseProto: string,
    }

    type BaseItem = BaseProtoItem & {
      baseItem: string,
      baseInputValue: string
    }

    type BaseInput = {
      baseInputSource: string
    }

    staticRecordsFactory<BaseItem, BaseProtoItem, BaseInput>({
      creator(id, recordType) {
        expectTypeOf(id).toEqualTypeOf<string>()
        expectTypeOf(recordType).toEqualTypeOf<string>()

        return {
          baseProto: `base-proto-${recordType}-${id}`,
          [recordTypeKey]: recordType,
          id,
        }
      },
      filler(item, input) {
        expectTypeOf(item).toEqualTypeOf<BaseProtoItem>()
        expectTypeOf(input).toEqualTypeOf<NeverProtoKeys<BaseInput, BaseProtoItem>>()

        type expected = {
          id?: never
          [recordTypeKey]?: never,
          baseProto?: never,
          baseInputSource: string,
          // note: should not be included as input overrides all
          // baseItem: string,
        }

        expectTypeOf(input).toExtend<expected>()
        expectTypeOf(input).toMatchObjectType<expected>()
        expectTypeOf<keyof typeof input>().toEqualTypeOf<keyof expected>()
        Object.assign(item, input)
      },
    })
  })

  describe('test utility types', () => {

    it('MakeOptionsInput[BaseItem]', () => {
      type BaseItem = {
        id: string,
        baseItem: string,
      }

      type Result = MakeOptionsInput<BaseItem>
      type expected = {
        id?: never
        [recordTypeKey]?: never,
        baseItem: string,
      }

      expectTypeOf<Result>().toExtend<expected>()
      expectTypeOf<Result>().toMatchObjectType<expected>()
      expectTypeOf<keyof Result>().toEqualTypeOf<keyof expected>()
    })

    it('MakeOptionsInput[BaseItem, BaseProtoItem]', () => {
      type BaseProtoItem = DefaultProtoItem & {
        baseProto: string,
      }

      type BaseItem = BaseProtoItem & {
        baseItem: string,
      }

      type Result = MakeOptionsInput<BaseItem, BaseProtoItem>
      type expected = {
        id?: never
        [recordTypeKey]?: never,
        baseProto?: never,
        baseItem: string,
      }

      expectTypeOf<Result>().toExtend<expected>()
      expectTypeOf<Result>().toMatchObjectType<expected>()
      expectTypeOf<keyof Result>().toEqualTypeOf<keyof expected>()
    })

    it('MakeOptionsInput[BaseItem, BaseProtoItem, BaseInput]', () => {
      type BaseProtoItem = DefaultProtoItem & {
        baseProto: string,
      }

      type BaseItem = BaseProtoItem & {
        baseItem: string,
      }

      type BaseInput = {
        baseInputSource: string
      }

      type Result = MakeOptionsInput<BaseItem, BaseProtoItem, BaseInput>
      type expected = {
        id?: never
        [recordTypeKey]?: never,
        baseProto?: never,
        // note: should not be included as input overrides all
        // baseItem: string,
        baseInputSource: string,
      }

      expectTypeOf<Result>().toExtend<expected>()
      expectTypeOf<Result>().toMatchObjectType<expected>()
      expectTypeOf<keyof Result>().toEqualTypeOf<keyof expected>()
    })
    it('IfNever[]', () => {

      expectTypeOf<
        IfNever<1, 2, 3>
      >().toEqualTypeOf<1>()

      expectTypeOf<
        IfNever<never, 2, 3>
      >().toEqualTypeOf<2>()

      expectTypeOf<
        IfNever<never, never, 3>
      >().toEqualTypeOf<3>()

      expectTypeOf<
        IfNever<never, never>
      >().toEqualTypeOf<never>()
    })
  })
})