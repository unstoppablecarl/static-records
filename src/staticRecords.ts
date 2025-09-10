import { deepFreeze } from './deepFreeze'
import { recordTypeKey } from './recordTypeKey'

export interface HasId {
  id: string,
}

export interface HasRecordKey {
  [recordTypeKey]: string
}

export type WithRecordType<T extends HasId> = T & HasRecordKey

type ItemToInput<T> = Omit<T, 'id' | typeof recordTypeKey>

export type StaticRecords<
  Item extends HasId,
  Input = ItemToInput<Item>
> = {
  define(id: string, factory: (item: Item) => Input): WithRecordType<Item>,
  get(id: string): WithRecordType<Item>,
  has(id: string): boolean,
  lock(): void,
  locked(): boolean,
  toArray(): WithRecordType<Item>[],
  toObject(): Record<string, WithRecordType<Item>>,
}

type Creator = (id: string, recordType: string) => HasId & HasRecordKey

export type Options<
  Item extends HasId,
  Input = ItemToInput<Item>
> = {
  deepFreeze?: false | (<T extends Record<string | symbol, any>>(obj: T) => T),
  creator?: Creator,
  filler?: (item: WithRecordType<Item>, input: Input) => void,
}

export function staticRecords<
  Item extends HasId,
  Input = ItemToInput<Item>
>(recordType: string, opt?: Options<Item, Input>): StaticRecords<Item, Input> {
  type ItemWithKey = WithRecordType<Item>
  type Factory = (item: ItemWithKey) => Input

  const staticData: Record<string, ItemWithKey> = {}
  const definers: Map<string, Factory> = new Map()
  const freezer = opt?.deepFreeze ?? deepFreeze
  let locked = false

  const creator: Creator = opt?.creator ?? ((id, recordType) => {
    return {
      id,
      [recordTypeKey]: recordType,
    }
  })

  const filler = opt?.filler ?? Object.assign

  return {
    define(id: string, factory: Factory): ItemWithKey {
      if (locked) {
        throw new Error(`Cannot define() after locking Static Records "${recordType}".`)
      }

      if (staticData[id]) {
        throw new Error(`A Static Record Type "${recordType}" with id "${id}" already exists.`)
      }

      const item = creator(id, recordType) as ItemWithKey

      staticData[id] = item
      definers.set(id, factory)

      return item
    },
    lock() {
      if (locked) {
        throw new Error(`Cannot lock() when Static Record Type "${recordType}" is already locked.`)
      }
      Object.values(staticData).forEach(item => {
        const factory = definers.get(item.id) as Factory
        filler(item, factory(item))

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