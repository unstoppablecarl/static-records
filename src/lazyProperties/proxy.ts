import type { Rec } from '../type-util'
import type { HasParent } from '../lazyProperties'

export const PROXY_KEY: unique symbol = Symbol('proxy')

export function makeProxy<T extends Rec>(
  target: T,
  parent: Rec | undefined,
  selfParentProp: string | symbol | undefined,
  proxyType: string,
  parentKey: string | null,
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
          writable: false,
        }
      }
      if (p === selfParentProp) {
        const desc = Reflect.getOwnPropertyDescriptor(target, p) as PropertyDescriptor

        return {
          configurable: desc.configurable,
          enumerable: desc.enumerable,
          writable: desc.writable,
          value: undefined,
        }
      }
      if (__DEV__ && p === PROXY_KEY) {
        return {
          configurable,
          enumerable,
          value: proxyType + '.' + String(selfParentProp),
          writable,
        }
      }

      return Reflect.getOwnPropertyDescriptor(target, p)
    },
    ownKeys(target: T): (string | symbol)[] {
      return [
        ...parentKey ? [parentKey] : [],
        ...__DEV__ ? [PROXY_KEY] : [],
        ...Reflect.ownKeys(target),
      ]
    },
  }) as HasParent
}
