import { type HasId, isStaticRecord } from './recordType'
import type { Rec } from './type-util'
import type { Freezer } from './staticRecords'

export type HasParent = Rec & {
  parent: HasParent | undefined
}

export type ObjWithParent<T extends Rec> = T & HasParent

export type Lazy<T extends any = any, P extends Rec = Rec> = {
  [LAZY_RESOLVER]: true,
  (parent: ObjWithParent<P>, root: Rec | undefined): T
} | T

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_PROPS: unique symbol = Symbol(__DEV__ ? 'Lazy Properties' : '')
// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_RESOLVER: unique symbol = Symbol(__DEV__ ? 'Lazy Function' : '')

export function lazy<T, S extends Rec, R extends Rec>(resolver: (self: ObjWithParent<S>, root: ObjWithParent<R>) => T): Lazy<T> {
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

export function lazyFrozenFiller<
  Item extends HasId & Rec,
  Input extends Rec
>(item: Item, input: Input, freezer: Freezer) {
  fillLazyProps(item, input, freezer, 'lazyFrozenFiller', true)

}

export function lazyFiller<
  Item extends HasId & Rec,
  Input extends Rec
>(item: Item, input: Input, freezer: Freezer) {
  fillLazyProps(item, input, freezer, 'lazyFiller', false)
}

const validChild = (v: any) => !Object.isFrozen(v) && !isStaticRecord(v)

function fillLazyProps(
  item: Rec,
  input: Rec,
  freezer: Freezer,
  method: string,
  freeze: boolean,
) {
  if (freezer !== false) {
    throw new Error(`When using filler: ${method}, option.freeze must be false`)
  }
  Object.assign(item, input)

  const root = item
  const visited: WeakSet<any> = new WeakSet<any>()

  bindLazyProps(item)

  function bindLazyProps(
    target: Rec,
    parentProxy?: HasParent,
    rootProp?: string | symbol,
  ) {
    if (visited.has(target)) {
      return
    }
    visited.add(target)

    const hasLazy = hasLazyResolvers(target)

    if (!hasLazy) {
      if (freeze) {
        Object.freeze(target)
      }
      for (const prop of Reflect.ownKeys(target)) {
        const value = target[prop]
        if (validChild(value)) {
          bindLazyProps(
            value,
            makeProxy(target, parentProxy, prop, 'parent', 'Parent'),
            rootProp ?? prop,
          )
        }
      }
      return
    }

    // has lazy props
    for (const prop of Reflect.ownKeys(target)) {
      const value = target[prop]

      if (!isLazyResolver(value)) {
        if (freeze) {
          Object.defineProperty(target, prop, {
            value: value,
            writable: false,
            configurable: false,
            enumerable: true,
          })
        }
        if (validChild(value)) {
          bindLazyProps(
            value,
            makeProxy(target, parentProxy, prop, 'parent', 'Parent'),
            rootProp ?? prop,
          )
        }
        continue
      }

      // define lazy prop
      if (__DEV__) {
        trackLazyProp(target, prop)
      }
      Object.defineProperty(target, prop, {
        get() {
          const newValue = value(
            makeProxy(target, parentProxy, prop, 'parent', 'Parent'),
            makeProxy(root as Rec, undefined, rootProp ?? prop, undefined, 'Root'),
          )

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
            bindLazyProps(
              newValue,
              makeProxy(target, parentProxy, prop, 'parent', 'Parent'),
              rootProp ?? prop,
            )
          }

          return newValue
        },
        configurable: true,
      })
    }

    if (freeze) {
      // no new properties
      Object.preventExtensions(target)
    }
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

export const PROXY_KEY: unique symbol = Symbol('Self Proxy')

function makeProxy<T extends Rec>(
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
