import { type Options, staticRecords } from './staticRecords'
import type { NeverProtoKeys, Rec } from './type-util'
import type { DefaultProtoItem, HasId } from './recordTypeKey'

export type IfNever<
  Input,
  Item,
  Default = never
> =
  [Input] extends [never] ?
  [Item] extends [never] ? Default : Item : Input

export type MakeOptionsInput<
  Item extends HasId,
  ProtoItem extends DefaultProtoItem = DefaultProtoItem,
  Input extends Rec = never,
> = NeverProtoKeys<IfNever<Input, Item>, ProtoItem>

export function staticRecordsFactory<
  BaseItem extends HasId,
  BaseProtoItem extends DefaultProtoItem = DefaultProtoItem,
  BaseInput extends Rec = never
>(defaultOptions?: Options<
  BaseProtoItem,
  MakeOptionsInput<BaseItem, BaseProtoItem, BaseInput>
>) {

  return <
    Item extends BaseItem = BaseItem,
    ProtoItem extends BaseProtoItem = BaseProtoItem,
    Input extends IfNever<BaseInput, Rec> = never
  >(
    recordType: string,
    options?: Options<
      ProtoItem,
      MakeOptionsInput<Item, ProtoItem, IfNever<BaseInput, {}> & IfNever<Input, Omit<Item, keyof ProtoItem>>>
    >,
  ) => {

    type MergedInput = MakeOptionsInput<Item, ProtoItem, IfNever<BaseInput, {}> & IfNever<Input, Omit<Item, keyof ProtoItem>>>

    const opt = {
      ...defaultOptions,
      ...options,
    } as Options<ProtoItem, MergedInput>

    return staticRecords<Item, ProtoItem, MergedInput>(recordType, opt)
  }
}
