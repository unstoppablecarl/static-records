import type { Rec } from '../type-util'
import type { HasParent } from '../lazyProperties'

export const PROXY_KEY: unique symbol = Symbol('Proxy')

export function makeProxy<T extends Rec>(
  target: T,
  parent: Rec | undefined,
  selfParentProp: string | symbol | undefined,
  PARENT_KEY: string | undefined = 'parent',
  PROXY_VALUE: string | undefined = undefined,
): HasParent {
  return new Proxy(target, {
    get(target: T, p: PropertyKey, receiver?: any): any {
      if (p === PARENT_KEY) {
        return parent
      }
      if (p === selfParentProp) {
        return undefined
      }
      if (__DEV__ && p === PROXY_KEY) {
        return PROXY_VALUE
      }
      return Reflect.get(target, p, receiver)
    },
    has(target: T, p: PropertyKey): boolean {
      if (p === PARENT_KEY) {
        return true
      }
      if (p === selfParentProp) {
        return false
      }
      if (__DEV__ && p === PROXY_KEY) {
        return true
      }
      return Reflect.has(target, p)
    },
    getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
      const configurable = true
      const enumerable = true
      const writable = true

      if (p === PARENT_KEY) {
        return {
          configurable,
          enumerable,
          value: parent,
          writable,
        }
      }

      if (__DEV__ && p === PROXY_KEY) {
        return {
          configurable,
          enumerable,
          value: true,
          writable,
        }
      }

      return Reflect.getOwnPropertyDescriptor(target, p)
    },
    ownKeys(target: T): (string | symbol)[] {
      const keys = Reflect.ownKeys(target)
      return [
        ...PARENT_KEY ? [PARENT_KEY] : [],
        ...__DEV__ ? [PROXY_KEY] : [],
        ...keys.filter((key) => key !== selfParentProp),
      ]
    },
  }) as HasParent
}
