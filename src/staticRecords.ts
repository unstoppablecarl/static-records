import { deepFreeze } from './deepFreeze'
import { staticKey } from './staticKey'

export interface IdItem {
  id: string,
  [staticKey]: string | boolean,
}

export type StaticRecords<Item extends IdItem> = {
  define(id: string, factory: () => Omit<Item, 'id'>): Item,
  get(id: string): Item,
  has(id: string): boolean,
  lock(): void,
  locked(): boolean,
  toArray(): Item[],
  toObject(): Record<string, Item>,
}

export type Options = {
  deepFreeze?: false | (<T extends Record<string | symbol, any>>(obj: T) => T),
}

export function staticRecords<
  Item extends IdItem,
>(recordType: string, opt?: Options): StaticRecords<Item> {
  type ItemNoId = Omit<Item, 'id'>
  type Factory = () => ItemNoId

  const staticData: Record<string, Item> = {}
  const definers: Map<string, Factory> = new Map()
  const freezer = opt?.deepFreeze ?? deepFreeze
  let locked = false

  function define(id: string, factory: Factory): Item {
    if (locked) {
      throw new Error(`Cannot define records after locking Static Records: "${recordType}".`)
    }
    const item = {
      id,
      [staticKey]: recordType,
    }
    staticData[id] = item as Item
    definers.set(id, factory)

    return item as Item
  }

  function has(id: string): boolean {
    return staticData[id] !== undefined
  }

  function get(id: string): Item {
    const result = staticData[id]
    if (result === undefined) {
      throw new Error(`Cannot find ${id} in Static Records: "${recordType}"`)
    }

    return result
  }

  function lock(): void {
    if (locked) {
      throw new Error(`Cannot lock when Static Records: "${recordType}" are already locked.`)
    }
    Object.values(staticData).forEach(item => {
      const factory = definers.get(item.id) as Factory
      Object.assign(
        item,
        factory(),
      )
      if (freezer) {
        freezer(item)
      }
    })

    // always freeze records object
    Object.freeze(staticData)
    definers.clear()
    locked = true
  }

  function toObject() {
    // create unfrozen copy
    return {
      ...staticData,
    }
  }

  return {
    define,
    lock,

    get,
    has,
    locked: () => locked,
    toObject,
    toArray: () => Object.values(staticData),
  }
}