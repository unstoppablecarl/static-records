import { deepFreeze } from './deepFreeze'

export const staticKey: symbol = Symbol('record_type')

export function isStaticRecord(obj: any | Record<string | symbol, unknown>) {
  return obj[staticKey] !== undefined
}

export function getRecordType(obj: any) {
  return obj[staticKey]
}

export interface IdItem {
  id: string,
  [staticKey]: string | boolean,
}

export type StaticRecords<Item extends IdItem> = {
  define(id: string, factory: () => Omit<Item, 'id'>): Item,
  get(id: string): Item,
  has(id: string): boolean,
  lock(): void,
  toArray(): Item[],
  toObject(): Record<string, Item>,
  forEach(callback: (item: Item, index: number, array: Item[]) => void, thisArg?: any): void,
  map<U>(callback: (value: Item, index: number, array: Item[]) => U, thisArg?: any): U[],
  filter(callback: (value: Item, index: number, array: Item[]) => unknown, thisArg?: any): Item[],
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
      throw new Error('Cannot define records after locking.')
    }
    const item = {
      id,
      [staticKey]: recordType,
    }
    // if (recordTypeKey) {
    //   item[recordTypeKey] = recordType
    // }
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
      throw new Error(`Cannot find ${id} in Static Records "${recordType}"`)
    }

    return result
  }

  function lock(): void {
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

    // always freeze main records object
    Object.freeze(staticData)
    definers.clear()
    locked = true
  }

  function toObject() {
    return {
      ...staticData,
    }
  }

  return {
    define,
    lock,

    get,
    has,
    toObject,
    toArray: () => Object.values(staticData),
    forEach: (callback, thisArg) => {
      return Object.values(staticData).forEach(callback, thisArg)
    },
    map: (callback, thisArg) => {
      return Object.values(staticData).map(callback, thisArg)
    },
    filter: (callback, thisArg) => {
      return Object.values(staticData).filter(callback, thisArg)
    },
  }
}