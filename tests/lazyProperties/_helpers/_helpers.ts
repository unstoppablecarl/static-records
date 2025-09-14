import { LAZY_PROPS } from '../../../src/lazyProperties/trackLazyProps'
import { PROXY_KEY } from '../../../src/lazyProperties/proxy'

export function getLazyProps(target: Record<PropertyKey, unknown>): undefined | Set<string> {
  return target[LAZY_PROPS] as undefined | Set<string>
}

export function isProxy(target: any): boolean {
  return !!target[PROXY_KEY]
}