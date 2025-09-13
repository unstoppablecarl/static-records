// set keys of ProtoItem to undefined | never on the Item
// to prevent overwrites when filling
export type NeverProtoKeys<Item, ProtoItem> = Omit<Item, keyof ProtoItem> & {
  [K in keyof ProtoItem]?: never
}
export type Rec = Record<PropertyKey, any>

