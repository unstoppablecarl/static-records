import { PROXY_KEY } from '../../../src/lazyProperties/proxy'
import type { Rec } from '../../../src/type-util'

export function isProxy(target: any): boolean {
  return !!target[PROXY_KEY]
}

export function objectKeysWithoutRef(target: Rec) {
  return Object.keys(Object.getOwnPropertyDescriptors(target)).sort()
}