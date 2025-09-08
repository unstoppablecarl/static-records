export const staticKey: unique symbol = Symbol('record_type')

export function isStaticRecord(obj: any) {
  return obj[staticKey] !== undefined
}

export function getRecordType(obj: any): string | undefined {
  return obj[staticKey]
}