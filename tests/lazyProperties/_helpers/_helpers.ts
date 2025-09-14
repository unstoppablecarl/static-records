import { LAZY_PROPS, SELF_PROXY } from '../../../src'

export function getLazyProps(target: Record<PropertyKey, unknown>): undefined | Set<string> {
  return target[LAZY_PROPS] as undefined | Set<string>
}

export function isProxy(target: any): boolean {
  return !!target[SELF_PROXY]
}