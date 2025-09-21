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

export function hasAnyLazyResolvers(target: Rec): boolean {
  return !!Object.values(target).find(isAnyLazyResolver)
}

export type HasParent<
  Target extends Rec = Rec,
  ParentKey extends string = 'parent',
> = Target & {
  [K in ParentKey]?: HasParent<Rec, ParentKey>
}

export type RootBase = Rec & HasId

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

export type To<
  T,
  P extends DotPaths<T>,
  ParentKey extends string = 'parent'
> = {
  __brand_LazyTreePath: true,
  path: Path<T, P>,
  parent: PathParent<T, P, ParentKey>
  root: T,
}

export function lazyTree<PathTree>(
  resolver: PathTree extends To<any, any, any>
    ? PathTree extends { __brand_LazyTreePath: true }
      ? LazyTreeResolverFunction<PathTree['path'], PathTree['parent'], PathTree['root']>
      : never
    : never,
): PathTree extends To<any, any, any> ? PathTree['path'] : never;

// Parent can be HasParent and work correctly
export function lazyTree<
  T = never,
  Parent extends Rec | undefined = never,
  Root extends RootBase = never,
  // NOTE: If ParentKey is provided it will transform Parent:
  // - HasParent types get their ParentKey replaced
  // - Rec types get wrapped in HasParent<Parent, ParentKey>
  ParentKey extends string = 'parent'
>(
  resolver: (
    // if Parent is not provided
    parent: [Parent] extends [never]
      // use as Parent default
      ? HasParent<Rec, ParentKey> | undefined
      // if Parent is a HasParent type, extract its Target type
      : Parent extends HasParent<infer InferredTarget, infer _ParentKey>
        // rebuild HasParent using extracted InferredTarget but with ParentKey
        ? HasParent<InferredTarget, ParentKey>
        // if Parent is explicitly undefined
        : Parent extends undefined
          ? undefined
          : Parent extends Rec
            // wrap Parent in HasParent
            ? HasParent<Parent, ParentKey>
            // should never happen given our constraints
            : never,
    // if root not provided use RootBase
    root: [Root] extends [never] ? RootBase : Root,
    // if T not provided use any
    // T will actually be ReturnType<typeof resolver> not 'any'
  ) => ([T] extends [never] ? any : T),
  // if T not provided use any
  // T will actually be ReturnType<typeof resolver> not 'any'
): [T] extends [never] ? any : T;

// create a lazy tree resolver
export function lazyTree(resolver: any): any {
  return Object.assign(resolver, { [LAZY_RESOLVER]: LazyResolverType.TREE })
}

