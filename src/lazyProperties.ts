import type { Rec } from './type-util'

// Stryker disable next-line all
/* v8 ignore next -- @preserve */
export const LAZY_RESOLVER: unique symbol = Symbol(__DEV__ ? 'Lazy Function' : '')

export enum LazyResolverType {
  DEFAULT = 1,
  TREE = 2,
}

export type LazyResolverFunction<T = unknown> = () => T

export interface LazyResolver<T = unknown> extends LazyResolverFunction<T> {
  [LAZY_RESOLVER]: LazyResolverType.DEFAULT
}

// a resolver OR the resolved value
export type Lazy<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> = LazyResolver<T> | LazyTreeResolver<T, Parent, Root> | T

export function lazy<T = any>(resolver: LazyResolverFunction<T>) {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.DEFAULT }) as LazyResolver<T>
}

// lazy.tree = lazyTree

export function isAnyLazyResolver<T>(
  value: unknown,
): value is LazyResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] !== undefined
}

export function isLazyDefaultResolver<T>(
  value: unknown,
): value is LazyTreeResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] === LazyResolverType.DEFAULT
}

export function isLazyTreeResolver<T>(
  value: unknown,
): value is LazyTreeResolver<T> {
  return typeof value === 'function' && (value as any)[LAZY_RESOLVER] === LazyResolverType.TREE
}

export function getLazyResolverType(target: unknown): LazyResolverType | undefined {
  if (typeof target !== 'function') {
    return undefined
  }
  return (target as any)[LAZY_RESOLVER]
}

export function hasLazyResolvers(target: Rec): boolean {
  return !!Object.values(target).find(isAnyLazyResolver)
}

export type HasParent = Rec & {
  parent?: HasParent
}

export type LazyTreeResolverFunction<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> = (
  parent: Parent,
  root: Root,
) => T

// this differentiates between a resolver function and
// its return value which may be a function
export interface LazyTreeResolver<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> extends LazyTreeResolverFunction<T, Parent, Root> {
  [LAZY_RESOLVER]: LazyResolverType.TREE
}

// a resolver or the resolved value
export type LazyTree<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
> = LazyTreeResolver<T, Parent, Root> | T

export function lazyTree<
  T = any,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends HasParent | undefined = HasParent | undefined,
>(resolver: LazyTreeResolverFunction<T, Parent, Root>): LazyTreeResolver<T, Parent, Root> {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.TREE }) as LazyTreeResolver<T, Parent, Root>
}
