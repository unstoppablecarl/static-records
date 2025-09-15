import type { Rec } from '../type-util'
import type { HasParent } from '../lazyProperties'

export const PROXY_KEY: unique symbol = Symbol('proxy')

export function makeProxy<T extends Rec>(
  target: T,
  parent?: Rec,
  selfParentProp?: string | symbol,
  proxyType?: string | undefined,
  parentKey: string | null = 'parent',
): HasParent {
  return new Proxy(target, {
    get(target: T, p: PropertyKey, receiver?: any): any {
      if (p === parentKey) {
        return parent
      }
      if (p === selfParentProp) {
        return undefined
      }
      if (__DEV__ && p === PROXY_KEY) {
        return proxyType + '.' + String(selfParentProp)
      }
      return Reflect.get(target, p, receiver)
    },
    has(target: T, p: PropertyKey): boolean {
      if (p === parentKey) {
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

      if (p === parentKey) {
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
        ...parentKey ? [parentKey] : [],
        ...__DEV__ ? [PROXY_KEY] : [],
        ...keys.filter((key) => key !== selfParentProp),
      ]
    },
  }) as HasParent
}
