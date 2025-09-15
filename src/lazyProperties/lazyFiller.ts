import { type HasId, isStaticRecord } from '../recordType'
import type { Rec } from '../type-util'
import { hasLazyResolvers, type HasParent, isLazyResolver } from '../lazyProperties'
import type { Filler, Freezer } from '../staticRecords'
import { makeProxy } from './proxy'
import { trackLazyProp, untrackLazyProp } from './trackLazyProps'

export function lazyFrozenFiller<
  ProtoItem extends HasId,
  Input extends Rec
>(item: ProtoItem, input: Input, freezer: Freezer) {
  rawLazyFiller(item, input, freezer, 'lazyFrozenFiller', true)
}

export function lazyFiller<
  ProtoItem extends HasId,
  Input extends Rec
>(item: ProtoItem, input: Input, freezer: Freezer) {
  rawLazyFiller(item, input, freezer, 'lazyFiller', false)
}

export type BoundTargetTracker = {
  has(v: any): boolean,
  add(v: any): void,
}

export function makeLazyFiller<
  ProtoItem extends HasId,
  Input extends Rec,
>({
    freeze = false,
    parentKey = 'parent',
    boundTargets = new WeakSet<any>() as BoundTargetTracker,
  }: {
  freeze?: boolean,
  parentKey?: string,
  boundTargets?: BoundTargetTracker,
} = {}): Filler<ProtoItem, Input> {
  return ((item: ProtoItem, input: Input, freezer: Freezer) => {

    rawLazyFiller(
      item,
      input,
      freezer,
      'makeLazyFiller',
      freeze,
      parentKey,
      boundTargets,
    )
  })
}

const validChild = (v: any) => !Object.isFrozen(v) && !isStaticRecord(v)

const PARENT_TYPE = 'parent'
const ROOT_TYPE = 'root'

export function rawLazyFiller(
  item: Rec,
  input: Rec,
  freezer: Freezer,
  method: string,
  freeze: boolean,
  parentKey = 'parent',
  boundTargets: BoundTargetTracker = new WeakSet<any>(),
) {
  if (freezer !== false) {
    throw new Error(`When using filler: ${method}, option.freeze must be false`)
  }
  Object.assign(item, input)

  const root = item

  bindLazyProps(item)

  function bindLazyProps(
    target: Rec,
    parentProxy?: HasParent,
    rootProp?: string | symbol,
  ) {
    if (boundTargets.has(target)) {
      return
    }
    boundTargets.add(target)

    if (hasLazyResolvers(target)) {
      processLazyObject(target, parentProxy, rootProp)
      return
    }
    processNonLazyObject(target, parentProxy, rootProp)
  }

  function processNonLazyObject(
    target: Rec,
    parentProxy?: HasParent,
    rootProp?: string | symbol,
  ) {
    if (freeze) {
      Object.freeze(target)
    }

    for (const prop of Reflect.ownKeys(target)) {
      const value = target[prop]
      if (validChild(value)) {
        const newRootProp = rootProp = rootProp ?? prop
        bindLazyProps(
          value,
          makeProxy(target, parentProxy, prop, PARENT_TYPE, parentKey),
          newRootProp,
        )
      }
    }
  }

  function processLazyObject(
    target: Rec,
    parentProxy?: HasParent,
    rootProp?: string | symbol,
  ) {
    for (const prop of Reflect.ownKeys(target)) {
      const value = target[prop]

      const newRootProp = rootProp ?? prop
      if (isLazyResolver(value)) {
        setupLazyProperty(target, prop, newRootProp, value, parentProxy)
      } else {
        processNonLazyProperty(target, prop, newRootProp, value, parentProxy)
      }
    }

    if (freeze) {
      Object.preventExtensions(target)
    }
  }

  function setupLazyProperty(
    target: Rec,
    prop: string | symbol,
    rootProp: string | symbol,
    resolver: Function,
    parentProxy?: HasParent,
  ) {
    if (__DEV__) {
      trackLazyProp(target, prop)
    }

    Object.defineProperty(target, prop, {
      get() {
        const newValue = resolver(
          makeProxy(target, parentProxy, prop, PARENT_TYPE, parentKey),
          makeProxy(root as Rec, undefined, rootProp, ROOT_TYPE, parentKey),
        )

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
            makeProxy(target, parentProxy, prop, PARENT_TYPE, parentKey),
            rootProp,
          )
        }

        return newValue
      },
      configurable: true,
    })
  }

  function processNonLazyProperty(
    target: Rec,
    prop: string | symbol,
    rootProp: string | symbol,
    value: any,
    parentProxy?: HasParent,
  ) {
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
        makeProxy(target, parentProxy, prop, PARENT_TYPE, parentKey),
        rootProp,
      )
    }
  }
}