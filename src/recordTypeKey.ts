export const recordTypeKey: unique symbol = Symbol(__DEV__ ? 'Record Type' : '')

export const isStaticRecord = (obj: any) => obj[recordTypeKey] !== undefined

export const getRecordType = (obj: any) => obj[recordTypeKey]

export type HasRecordKey = {
  [recordTypeKey]: string
}
export type HasId = {
  id: string,
}
export type DefaultProtoItem = HasId & HasRecordKey
export type WithRecordType<T extends HasId> = T & HasRecordKey