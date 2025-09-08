import { deepFreeze } from './deepFreeze'
import { recordTypeKey } from './recordTypeKey'

export interface IdItem {
  id: string,
}

export type WithKey<T> = T & {
  [recordTypeKey]: string
}

export type StaticRecords<
  Item extends IdItem,
  Input = Omit<Item, 'id'>
> = {
  define(id: string, factory: () => Input): WithKey<Item>,
  get(id: string): WithKey<Item>,
  has(id: string): boolean,
  lock(): void,
  locked(): boolean,
  toArray(): WithKey<Item>[],
  toObject(): Record<string, WithKey<Item>>,
}

export type Options<
  Item extends IdItem,
  Input = Omit<Item, 'id'>
> = {
  deepFreeze?: false | (<T extends Record<string | symbol, any>>(obj: T) => T),
  creator?: (id: string, recordType: string) => WithKey<Item>,
  locker?: (item: WithKey<Item>, input: Input) => void,
}

export function staticRecords<
  Item extends IdItem,
  Input = Omit<Item, 'id'>,
>(recordType: string, opt?: Options<Item, Input>): StaticRecords<Item, Input> {
  type Factory = () => Input
  type ItemWithKey = WithKey<Item>

  const staticData: Record<string, ItemWithKey> = {}
  const definers: Map<string, Factory> = new Map()
  const freezer = opt?.deepFreeze ?? deepFreeze
  let locked = false

  const creator = opt?.creator ?? ((id, recordType) => {
    return {
      id,
      [recordTypeKey]: recordType,
    } as ItemWithKey
  })

  const locker = opt?.locker ?? Object.assign

  return {
    define(id: string, factory: Factory): ItemWithKey {
      if (locked) {
        throw new Error(`Cannot define() after locking Static Records "${recordType}".`)
      }
      const item = creator(id, recordType) as ItemWithKey

      staticData[id] = item
      definers.set(id, factory)

      return item
    },
    lock() {
      if (locked) {
        throw new Error(`Cannot lock() when Static Records "${recordType}" are already locked.`)
      }
      Object.values(staticData).forEach(item => {
        const factory = definers.get(item.id) as Factory
        locker(item, factory())

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
        throw new Error(`Cannot find id "${id}" in Static Records "${recordType}"`)
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