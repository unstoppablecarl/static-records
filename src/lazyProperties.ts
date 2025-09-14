import { type HasId, isStaticRecord } from './recordType'
import type { Rec } from './type-util'
import type { Freezer } from './staticRecords'

export type HasParent = Rec & {
  parent: HasParent | undefined
}

export type Lazy<T extends any = any> = {
  [LAZY_RESOLVER]: true,
  (self: HasParent, root: Rec | undefined): T
} | T

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_PROPS: unique symbol = Symbol(__DEV__ ? 'Lazy Properties' : '')
// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_RESOLVER: unique symbol = Symbol(__DEV__ ? 'Lazy Function' : '')

export function lazy<T, S extends Rec>(resolver: (self: S & HasParent) => T): Lazy<T> {
  // @ts-expect-error
  resolver[LAZY_RESOLVER] = true
  return resolver as unknown as Lazy<T>
}

export function isLazyResolver(value: any): boolean {
  return typeof value === 'function' && value[LAZY_RESOLVER] === true
}

export function hasLazyResolvers(target: Rec): boolean {
  return !!Object.values(target).find(isLazyResolver)
}

const freezeMustBeFalse = (method: string) => `When using filler: ${method}, option.freeze must be false`

export function lazyFrozenFiller<
  Item extends HasId & Rec,
  Input extends Rec
>(item: Item, input: Input, freezer: Freezer) {
  if (freezer !== false) {
    throw new Error(freezeMustBeFalse(`lazyFrozenFiller`))
  }
  Object.assign(item, input)
  bindLazyProps(item, true)
}

export function lazyFiller<
  Item extends HasId & Rec,
  Input extends Rec
>(item: Item, input: Input, freezer: Freezer) {
  if (freezer !== false) {
    throw new Error(freezeMustBeFalse(`lazyFiller`))
  }

  Object.assign(item, input)
  bindLazyProps(item, false)
}

const validChild = (v: any) => !Object.isFrozen(v) && !isStaticRecord(v)

function bindLazyProps(
  target: Rec,
  freeze: boolean,
  parentProxy: HasParent | undefined = undefined,
  root: Rec | undefined = undefined,
  visited: WeakSet<any> = new WeakSet<any>(),
) {
  if (visited.has(target)) {
    return
  }
  visited.add(target)

  let hasLazy = hasLazyResolvers(target)
  if (!hasLazy) {
    if (freeze) {
      Object.freeze(target)
    }
  }

  if (root === undefined) {
    root = target
  }

  const propNames = Reflect.ownKeys(target)
  for (const prop of propNames) {
    const value = target[prop]

    if (!isLazyResolver(value)) {
      if (freeze && hasLazy) {
        Object.defineProperty(target, prop, {
          value: value,
          writable: false,
          configurable: false,
          enumerable: true,
        })
      }
      if (validChild(value)) {
        const newParentProxy = makeParentProxy(target, parentProxy, prop)
        bindLazyProps(value, freeze, newParentProxy, root, visited)
      }
      continue
    }
    // define lazy prop
    if (__DEV__) {
      trackLazyProp(target, prop)
    }
    Object.defineProperty(target, prop, {
      get() {

        const newTarget = makeParentProxy(target, parentProxy, prop)
        const newValue = value(newTarget, root)

        // convert lazy prop to normal prop
        Object.defineProperty(target, prop, {
          value: newValue,
          writable: !freeze,
          configurable: !freeze,
          enumerable: true,
        })

        if (__DEV__) {
          untrackLazyProp(target, prop)
        }

        if (validChild(newValue)) {
          const newParentProxy = makeParentProxy(target, parentProxy, prop)
          bindLazyProps(newValue, freeze, newParentProxy, root, visited)
        }

        return newValue
      },
      configurable: true,
    })
  }

  if (hasLazy && freeze) {
    // no new properties
    Object.preventExtensions(target)
  }
}

function trackLazyProp(item: Rec, prop: PropertyKey) {
  const set = (item[LAZY_PROPS] = item[LAZY_PROPS] ?? new Set()) as Set<PropertyKey>
  set.add(prop)
}

function untrackLazyProp(item: Rec, prop: PropertyKey) {
  let set = item[LAZY_PROPS] as Set<PropertyKey>
  set.delete(prop)
  if (set.size === 0) {
    delete item[LAZY_PROPS]
    return true
  }
  return false
}

export const SELF_PROXY: unique symbol = Symbol('Self Proxy')

function makeParentProxy<T extends Rec>(target: T, parent: Rec | undefined, selfProp: string | symbol): HasParent {
  if (selfProp === 'static') {
    console.log('makeParentProxy: ', { target, parent, selfProp })
  }
  return new Proxy(target, {
    get(target: T, p: PropertyKey, receiver?: any): any {
      if (p === 'parent') {
        return parent
      }
      if (p === selfProp) {
        throw new Error(`cannot read self property: "${String(selfProp)}" inside its own resolver`)
      }
      if (__DEV__ && p === SELF_PROXY) {
        return true
      }
      return Reflect.get(target, p, receiver)
    },
    has(target: T, p: PropertyKey): boolean {
      if (p === 'parent') {
        return true
      }
      if (p === selfProp) {
        return true
      }
      if (__DEV__ && p === SELF_PROXY) {
        return true
      }
      return Reflect.has(target, p)
    },
    getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
      const configurable = true
      const enumerable = true
      const writable = true

      if (p === 'parent') {
        return {
          configurable,
          enumerable,
          value: parent,
          writable,
        }
      }

      if (__DEV__ && p === SELF_PROXY) {
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
        'parent',
        selfProp,
        ...__DEV__ ? [SELF_PROXY] : [],
        ...keys.filter((key) => key !== selfProp),
      ]
    },
  }) as HasParent
}
