import { type HasId, isStaticRecord } from './recordType'
import type { Rec } from './type-util'
import type { Locker } from './staticRecords'

export function frozenLocker<
  Item extends HasId,
>(item: Item): void {
  deepFreeze(item)
}

const _frozenLocker: Locker<HasId> = frozenLocker

export function deepFreeze(obj: Rec): void {
  const propNames = Reflect.ownKeys(obj)

  // always freeze the targeted obj
  Object.freeze(obj)

  for (const name of propNames) {
    const value = obj[name]

    if (
      !Object.isFrozen(value) &&
      // do not freeze other static records that are child properties of this static record
      // they will be frozen by their own lock() function
      !isStaticRecord(value)
    ) {
      deepFreeze(value as Rec)
    }
  }
}