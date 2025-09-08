export const recordTypeKey: unique symbol = Symbol('record_type')

export const isStaticRecord = (obj: any) => obj[recordTypeKey] !== undefined

export const getRecordType = (obj: any) => obj[recordTypeKey]