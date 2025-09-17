/**
 * Ensures that keys from ProtoItem cannot be overwritten in Item.
 * This prevents accidental property conflicts when filling objects.
 *
 * @example
 * type Safe = NeverProtoKeys<{name: string, age: number}, {id: string}>
 * // Result: {name: string, age: number, id?: never}
 */
export type NeverProtoKeys<Item, ProtoItem> = Omit<Item, keyof ProtoItem> & {
  [K in keyof ProtoItem]?: never
}

export type Rec = Record<PropertyKey, unknown>

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;