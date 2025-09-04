export const staticKey: symbol = Symbol('record_type')

export function isStaticRecord(obj: any) {
  return obj[staticKey] !== undefined
}

export function getRecordType(obj: any) {
  return obj[staticKey]
}