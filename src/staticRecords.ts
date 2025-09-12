import { deepFreeze } from './deepFreeze'
import { type DefaultProtoItem, type HasId, recordTypeKey, type WithRecordType } from './recordTypeKey'
import type { NeverProtoKeys, Rec } from './type-util'

export type StaticRecords<
  Item extends HasId,
  ProtoItem extends DefaultProtoItem = DefaultProtoItem,
  Input extends Rec = NeverProtoKeys<Item, ProtoItem>,
> = {
  define(id: string, definer: Definer<ProtoItem, Input>): WithRecordType<Item>,
  get(id: string): WithRecordType<Item>,
  has(id: string): boolean,
  lock(): void,
  locked(): boolean,
  toArray(): WithRecordType<Item>[],
  toObject(): Record<string, WithRecordType<Item>>,
}

export type Creator<R extends HasId> = (id: string, recordType: string) => R
export type Freezer = false | (<T extends Record<string | symbol, any>>(obj: T) => T)
export type Filler<
  ProtoItem extends Rec,
  Input extends Rec,
> = (item: ProtoItem, input: Input) => void

export type Definer<
  ProtoItem extends Rec,
  Input extends Rec
> = (item: ProtoItem) => Input

export type Options<
  ProtoItem extends HasId,
  Input extends Rec
> = {
  freezer?: Freezer,
  creator?: Creator<ProtoItem>,
  filler?: Filler<ProtoItem, Input>
}

export function staticRecords<
  Item extends HasId,
  ProtoItem extends DefaultProtoItem = DefaultProtoItem,
  Input extends Rec = NeverProtoKeys<Item, ProtoItem>,
>(
  recordType: string,
  options?: Options<ProtoItem, Input>,
): StaticRecords<Item, ProtoItem, Input> {
  type ItemWithKey = WithRecordType<Item>
  type Factory = Definer<ProtoItem, Input>

  const staticData: Record<string, ItemWithKey> = {}
  const definers: Map<string, Factory> = new Map()
  let locked = false

  const freezer = options?.freezer ?? deepFreeze
  const creator = options?.creator ?? ((id, recordType) => {
    return {
      id,
      [recordTypeKey]: recordType,
    }
  })
  const filler = options?.filler ?? Object.assign

  return {
    define(id: string, definer: Factory): ItemWithKey {
      if (locked) {
        throw new Error(`Cannot define() after locking Static Records "${recordType}".`)
      }

      if (staticData[id]) {
        throw new Error(`A Static Record Type "${recordType}" with id "${id}" already exists.`)
      }

      const item = creator(id, recordType) as ItemWithKey

      staticData[id] = item
      definers.set(id, definer)

      return item
    },
    lock() {
      if (locked) {
        throw new Error(`Cannot lock() when Static Record Type "${recordType}" is already locked.`)
      }
      Object.values(staticData).forEach(item => {
        const definer = definers.get(item.id) as Factory
        // at this point `item` is a ProtoItem,
        // but it is externally exposed as an Item type
        filler(
          item as unknown as ProtoItem,
          definer(item as unknown as ProtoItem),
        )

        if (freezer) {
          freezer(item)
        }
      })

      // always freeze records object
      Object.freeze(staticData)
      definers.clear()
      locked = true
    },
    get(id: string): ItemWithKey {
      const result = staticData[id]
      if (result === undefined) {
        throw new Error(`Cannot find a Static Record Type "${recordType}" with id "${id}".`)
      }

      return result
    },
    has: (id: string) => staticData[id] !== undefined,
    locked: () => locked,
    toObject() {
      // create unfrozen copy
      return {
        ...staticData,
      }
    },
    toArray: () => Object.values(staticData),
  }
}