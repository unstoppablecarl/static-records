import { isStaticRecord } from './index'

export function deepFreeze<T extends Record<string | symbol, any>>(obj: T): T {
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
      deepFreeze(value)
    }
  }

  return obj
}
