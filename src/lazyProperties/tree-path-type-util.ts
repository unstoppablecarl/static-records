// build deep dot-paths
export type DotPaths<T> =
  T extends (infer U)[]
    ? // For arrays: allow "number" and "number.<subpaths>"
    | 'number'
    | `number.${DotPaths<U>}`
    : T extends Record<string, any>
      ? {
        [K in keyof T & string]:
        // If member is array or object, allow nested paths
        T[K] extends (infer U2)[] | Record<string, any>
          ? K | `${K}.${DotPaths<T[K]>}`
          : K
      }[keyof T & string]
      : never;

// Split string on '.' into tuple
export type Split<S extends string, Delim extends string = '.'> =
  S extends `${infer Head}${Delim}${infer Tail}`
    ? [Head, ...Split<Tail, Delim>]
    : [S];

// Walk a tuple path to reach a type
export type AtPath<T, Path extends readonly any[]> =
  Path extends [infer K, ...infer Rest]
    ? K extends keyof T
      ? // normal object key
      Rest extends []
        ? T[K]
        : AtPath<T[K], Rest>
      : // handle arrays when current RETURN is an array and K is "number" or a numeric literal
      T extends (infer U)[]
        ? K extends 'number' | `${number}`
          ? Rest extends []
            ? U
            : AtPath<U, Rest>
          : never
        : never
    : T;

// recursively set parent type
export type ParentAtPath<T, Path extends readonly any[], ParentKey extends string = 'parent'> =
  Path extends readonly []
    ? never // root has no parent
    : Path extends readonly [infer _Last]
      ? T // parent of single-section path is root (no nested parent property)
      : Path extends readonly [...infer Init, infer _Last]
        ? Init extends readonly []
          ? T // If Init is empty, parent is root (no nested parent)
          : Init extends readonly [infer _Single]
            // Parent's parent is root
            ? AtPath<T, Init> & { [K in ParentKey]: T }
            // Recurse
            : AtPath<T, Init> & { [K in ParentKey]: ParentAtPath<T, Init, ParentKey> }
        : never;

// string-based wrappers that enforces P to be a valid DotPaths<RETURN>
// (so you get autocomplete)
export type Path<T, P extends DotPaths<T>> = AtPath<T, Split<P>>;
export type PathParent<
  T,
  P extends DotPaths<T>,
  ParentKey extends string = 'parent'
> = ParentAtPath<T, Split<P>, ParentKey>;


