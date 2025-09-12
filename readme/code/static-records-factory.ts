import { type DefaultProtoItem, recordTypeKey, staticRecordsFactory } from '../../src'

export type BaseItem = {
  id: string,
}

type BaseProtoItem = BaseItem & DefaultProtoItem & {
  uid: string,
}

export const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem>({
  creator(id, recordType) {
    return {
      // adding unique id
      uid: `${recordType}-${id}`,
      id,
      [recordTypeKey]: recordType,
    }
  },
  freezer: false,
})