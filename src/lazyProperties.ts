import type { Rec } from './type-util'

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

