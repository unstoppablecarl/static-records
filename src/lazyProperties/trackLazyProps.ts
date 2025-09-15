import type { Rec } from '../type-util'

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_PROPS: unique symbol = Symbol(__DEV__ ? 'Lazy Properties' : '')

export function trackLazyProp(item: Rec, prop: PropertyKey) {
  const set = (item[LAZY_PROPS] = item[LAZY_PROPS] ?? new Set()) as Set<PropertyKey>
  set.add(prop)
}

export function untrackLazyProp(item: Rec, prop: PropertyKey) {
  let set = item[LAZY_PROPS] as Set<PropertyKey>
  set.delete(prop)
  if (set.size === 0) {
    delete item[LAZY_PROPS]
  }
}
