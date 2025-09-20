import type { Rec } from './type-util'
import type { DotPaths, Path, PathParent } from './lazyProperties/tree-path-type-util'
import type { HasId } from './recordType'

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

// used in record input properties that can optionally use lazy()
export type Lazy<T = unknown> = LazyResolver<T> | T

// create a lazy resolver
export function lazy<T = any>(resolver: LazyResolverFunction<T>) {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.DEFAULT }) as T
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

export function hasAnyLazyResolvers<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends RootBase | undefined = RootBase | undefined
>(target: Rec): boolean {
  return !!Object.values(target).find(isAnyLazyResolver)
}

export type HasParent = Rec & {
  parent?: HasParent
}

export type RootBase = HasParent & HasId

// argument passed into lazyTree(resolver: LazyTreeResolverFunction)
export type LazyTreeResolverFunction<
  T = unknown,
  Parent extends HasParent | undefined = HasParent | undefined,
  Root extends RootBase = RootBase,
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
  Root extends RootBase = RootBase,
> extends LazyTreeResolverFunction<T, Parent, Root> {
  [LAZY_RESOLVER]: LazyResolverType.TREE
}

export type To<T, P extends DotPaths<T>> = {
  __brand_LazyTreePath: true,
  path: Path<T, P>,
  parent: PathParent<T, P>
  root: T,
}

export function lazyTree<
  T = never,
  Parent extends HasParent | undefined = never,
  Root extends RootBase = never
>(
  resolver: (
    // if parent not provided use HasParent | undefined
    parent: [Parent] extends [never] ? HasParent | undefined : Parent & HasParent,
    // if root not provided use RootBase
    root: [Root] extends [never] ? RootBase : Root
    // if T not provided use any
    // T will actually be ReturnType<typeof resolver> not 'any'
  ) => ([T] extends [never] ? any : T)
  // if T not provided use any
  // T will actually be ReturnType<typeof resolver> not 'any'
): [T] extends [never] ? any : T;

export function lazyTree<PathTree extends To<any, any>>(
  resolver: LazyTreeResolverFunction<PathTree['path'], PathTree['parent'], PathTree['root']>
): PathTree['path'];

// create a lazy tree resolver
export function lazyTree(resolver: any): any {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.TREE });
}