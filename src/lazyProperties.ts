import type { Rec } from './type-util'

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_RESOLVER: unique symbol = Symbol(__DEV__ ? 'Lazy Function' : '')

export type HasParent = Rec & {
  parent: HasParent | undefined
}

export type ObjWithParent<T extends Rec | undefined> = T extends undefined ? undefined : T & HasParent

export type LazyResolver<
  T = unknown,
  Parent extends Rec | undefined = Rec,
  Root extends Rec | undefined = Rec,
> = (
  parent: ObjWithParent<Parent>,
  root: ObjWithParent<Root>,
) => T

// this differentiates between a resolver function and
// its return value which may be a function
export interface BrandedLazyResolver<
  T = unknown,
  Parent extends Rec | undefined = Rec,
  Root extends Rec | undefined = Rec,
> extends LazyResolver<T, Parent, Root> {
  [LAZY_RESOLVER]: true
}

// return value of the lazy() function
export type Lazy<
  T = unknown,
  Parent extends Rec = Rec,
  Root extends Rec = Rec,
> = BrandedLazyResolver<T, Parent, Root> | T

export function lazy<
  T = any,
  Parent extends Rec = Rec,
  Root extends Rec = Rec,
>(resolver: LazyResolver<T, Parent, Root>): Lazy<T, Parent, Root> {
  return Object.assign(resolver, { [LAZY_RESOLVER]: true }) as Lazy<T, Parent, Root>
}

export function isLazyResolver<T>(
  value: unknown,
): value is BrandedLazyResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] === true
}

export function hasLazyResolvers(target: Rec): boolean {
  return !!Object.values(target).find(isLazyResolver)
}

