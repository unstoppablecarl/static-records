import type { Rec } from './type-util'

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_RESOLVER: unique symbol = Symbol(__DEV__ ? 'Lazy Resolver' : '')

export enum LazyResolverType {
  DEFAULT = 1,
  TREE = 2,
}

export type LazyResolverFunction<T = unknown> = () => T

// return value of lazy(() => {})
export interface LazyResolver<T = unknown> extends LazyResolverFunction<T> {
  [LAZY_RESOLVER]: LazyResolverType.DEFAULT
}

// recursively convert all property types to Lazy<T[K]>
export type OptionallyLazy<T> = {
  [K in keyof T]:
  // keep never
  T[K] extends never
    ? never
    //recurse objects
    : T[K] extends object
      ? OptionallyLazy<T[K]>
      : Lazy<T[K]>;
};

// any resolver OR the resolved value
// used in record input type property values
export type LazyAny<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> = LazyResolver<T> | LazyTreeResolver<T, Parent, Root> | T

// used in record input properties that can optionally use lazy()
export type Lazy<T = unknown> = LazyResolver<T> | T

// create a lazy resolver
export function lazy<T = any>(resolver: LazyResolverFunction<T>) {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.DEFAULT }) as LazyResolver<T> | T
}

export function isAnyLazyResolver<T>(
  value: unknown,
): value is LazyResolver<T> | LazyTreeResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] !== undefined
}

export function isLazyDefaultResolver<T>(
  value: unknown,
): value is LazyResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] === LazyResolverType.DEFAULT
}

export function isLazyTreeResolver<T>(
  value: unknown,
): value is LazyTreeResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] === LazyResolverType.TREE
}

export function hasAnyLazyResolvers(target: Rec): boolean {
  return !!Object.values(target).find(isAnyLazyResolver)
}

export type HasParent = Rec & {
  parent?: HasParent
}

// argument passed into lazyTree(resolver: LazyTreeResolverFunction)
export type LazyTreeResolverFunction<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> = (
  parent: Parent,
  root: Root,
) => T

// return value of lazyTree()
// the interface differentiates between a resolver function and
// its return value which may be a function
export interface LazyTreeResolver<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> extends LazyTreeResolverFunction<T, Parent, Root> {
  [LAZY_RESOLVER]: LazyResolverType.TREE
}

// a tree resolver or the resolved value
export type LazyTree<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> = LazyTreeResolver<T, Parent, Root> | T

export type OptionallyLazyTree<
  T = unknown,
  Root extends HasParent | undefined = HasParent | undefined,
> = {
  [K in keyof T]:
  // keep never
  T[K] extends never
    ? never
    //recurse objects
    : T[K] extends object
      ? OptionallyLazyTree<T[K], Root>
      : LazyTree<T[K], any, Root>;
};

export function lazyTree<
  T = any,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
>(resolver: LazyTreeResolverFunction<T, Parent, Root>) {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.TREE }) as LazyTreeResolver<T, Parent, Root> | T
}
