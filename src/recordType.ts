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
  readonly id: string,
}
export type DefaultProtoItem = HasId & HasRecordKey
export type WithRecordType<T extends HasId> = T & HasRecordKey

// helper for generating the default Input type that staticRecords would generate
export type MakeInput<
  Item extends HasId,
  ProtoItem extends DefaultProtoItem = DefaultProtoItem
> = NeverProtoKeys<Item, ProtoItem>
