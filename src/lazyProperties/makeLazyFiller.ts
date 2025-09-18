import { type HasId, isStaticRecord } from '../recordType'
import type { Rec } from '../type-util'
import { hasAnyLazyResolvers, type HasParent, isAnyLazyResolver, isLazyTreeResolver } from '../lazyProperties'
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
    lazyTree = false,
    parentKey = 'parent',
  }: {
  freeze?: boolean,
  parentKey?: string,
  lazyTree?: boolean,
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
      rootProxy?: HasParent,
    ) {
      if (boundTargets.has(target)) {
        return
      }
      boundTargets.add(target)

      const hasLazy = hasAnyLazyResolvers(target)
      if (!hasLazy && freeze) {
        Object.freeze(target)
      }

      for (const prop of Reflect.ownKeys(target)) {
        const value = target[prop]

        let newRootProxy = rootProxy ?? makeProxy(root as Rec, undefined, prop, ROOT_TYPE, parentKey)

        if (hasLazy) {
          if (isAnyLazyResolver(value)) {
            setupLazyProperty(target, prop, newRootProxy, value, parentProxy)
          } else {
            processNonLazyProperty(target, prop, newRootProxy, value, parentProxy)
          }
          continue
        }
        // non-lazy
        if (validChild(value)) {
          bindLazyProps(
            value,
            makeProxy(target, parentProxy, prop, PARENT_TYPE, parentKey),
            rootProxy,
          )
        }
      }
    }

    function setupLazyProperty(
      target: Rec,
      prop: string | symbol,
      rootProxy: HasParent,
      resolver: Function,
      parentProxy?: HasParent,
    ) {
      if (__DEV__) {
        trackLazyProp(target, prop)
      }
      const isTreeResolver = isLazyTreeResolver(resolver)

      if (!lazyTree && isTreeResolver) {
        throw new Error('lazyTree() resolver found a in makeLazyFiller() with option lazyTree = false')
      }

      Object.defineProperty(target, prop, {
        get() {
          let newValue
          if (isTreeResolver) {
            newValue = resolver(
              makeProxy(target, parentProxy, prop, PARENT_TYPE, parentKey),
              rootProxy,
            )
          } else {
            newValue = resolver()
          }

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
              rootProxy,
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
      rootProxy: HasParent | undefined,
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
          rootProxy,
        )
      }
    }
  })
}