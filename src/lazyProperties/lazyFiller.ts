import { type HasId, isStaticRecord } from '../recordType'
import type { Rec } from '../type-util'
import { hasAnyLazyResolvers, type HasParent, isAnyLazyResolver } from '../lazyProperties'
import type { Filler } from '../staticRecords'
import { makeProxy } from './proxy'
import { trackLazyProp, untrackLazyProp } from './trackLazyProps'

const validChild = (v: unknown): v is Rec => {
  return typeof v === 'object' && v !== null && !isStaticRecord(v)
}

const PARENT_TYPE = 'parent'
const ROOT_TYPE = 'root'

export function makeLazyFiller<
  ProtoItem extends HasId,
  Input extends Rec,
>({
    freeze = false,
    parentKey = 'parent',
  }: {
  freeze?: boolean,
  parentKey?: string,
} = {}): Filler<ProtoItem, Input> {
  return ((item: ProtoItem, input: Input) => {

    Object.assign(item, input)

    const root = item
    const boundTargets = new Set<any>()

    bindLazyProps(item)

    boundTargets.clear()

    function bindLazyProps(
      target: Rec,
      parentProxy?: HasParent,
      rootProp?: string | symbol,
    ) {
      if (boundTargets.has(target)) {
        return
      }
      boundTargets.add(target)

      if (hasAnyLazyResolvers(target)) {
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
        if (isAnyLazyResolver(value)) {
          setupLazyProperty(target, prop, newRootProp, value, parentProxy)
        } else {
          processNonLazyProperty(target, prop, newRootProp, value, parentProxy)
        }
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
            configurable: true,
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
  })
}