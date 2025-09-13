// Stryker disable next-line all
/* v8 ignore next -- @preserve */
const __DEV__ = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

export * from './deepFreeze'
export * from './staticRecords'
export * from './staticRecordsFactory'
export * from './recordTypeKey'
export type {
  NeverProtoKeys,
} from './type-util'
export type {
  HasRecordKey,
  WithRecordType,
  DefaultProtoItem,
  HasId,
} from './recordTypeKey'