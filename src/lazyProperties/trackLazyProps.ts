import type { Rec } from '../type-util'

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_PROPS: unique symbol = Symbol(__DEV__ ? 'Lazy Properties' : '')

export function trackLazyProp(target: Rec, prop: PropertyKey) {
  const set = (target[LAZY_PROPS] = target[LAZY_PROPS] ?? new Set()) as Set<PropertyKey>
  set.add(prop)
}

export function untrackLazyProp(target: Rec, prop: PropertyKey) {
  let set = target[LAZY_PROPS] as Set<PropertyKey>
  set.delete(prop)

  if (set.size === 0) {
    delete target[LAZY_PROPS]
  }
}

export function getLazyProps(target: Rec): undefined | PropertyKey[] {
  if (target[LAZY_PROPS] !== undefined) {
    let set = target[LAZY_PROPS] as Set<PropertyKey>
    return [...set.values()]
  }
}