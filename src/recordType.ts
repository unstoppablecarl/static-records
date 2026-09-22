import type { NeverProtoKeys } from './type-util'

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const recordTypeKey: unique symbol = Symbol(__DEV__ ? 'Record Type' : '')

export const isStaticRecord = (obj: any): obj is HasRecordKey => obj?.[recordTypeKey] !== undefined

export const getRecordType = (obj: any) => obj?.[recordTypeKey]

export type HasRecordKey = {
  readonly [recordTypeKey]: string
}
export type HasId = {
  readonly id: string | number,
}
export type DefaultProtoItem<Id extends string | number = string> = {
  readonly id: Id,
  readonly [recordTypeKey]: string,
}
export type WithRecordType<T extends HasId> = T & HasRecordKey

// helper for generating the default Input type that staticRecords would generate
export type MakeInput<
  Item extends HasId,
  ProtoItem extends DefaultProtoItem<string | number> = DefaultProtoItem
> = NeverProtoKeys<Item, ProtoItem>
