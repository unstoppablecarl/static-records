// @ts-expect-error
const __DEV__ = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

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