import { type HasId, isStaticRecord } from './recordType'
import type { Rec } from './type-util'
import type { Filler } from './staticRecords'

export function frozenFiller<
  ProtoItem extends HasId,
  Input extends Rec,
>(item: ProtoItem, input: Input): void {
  Object.assign(item, input)
  deepFreeze(item)
}

const _frozenFiller: Filler<HasId, Rec> = frozenFiller

export function deepFreeze(obj: Rec) {
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