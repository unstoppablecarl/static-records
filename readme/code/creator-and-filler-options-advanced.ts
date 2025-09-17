import { type DefaultProtoItem, recordTypeKey, staticRecords } from '../../src'

/*
the above imported type that is the base of all proto objects
type DefaultProtoItem = {
  readonly id: string,
  readonly [recordTypeKey]: string,
}
*/

type Widget = {
  readonly id: string,
  readonly name: string
}

type ProtoWidget = DefaultProtoItem & {
  readonly something: string,
}

type WidgetInput = {
  speed: number
}
const WIDGETS = staticRecords<Widget, ProtoWidget, WidgetInput>('Widget', {
  // ts infers return type is ProtoWidget
  creator(id: string, recordType: string) {
    return {
      id,
      [recordTypeKey]: recordType,
      something: 'extra',
    }
  },
  // ts infers argument types
  // item: ProtoWidget,
  // input: WidgetInput,
  filler(item, input) {
    Object.assign(item, input)
  },
})

const BOOP = WIDGETS.define(
  'BOOP',
  // factory must return WidgetInput
  () => ({
    name: 'Boop',
    speed: 99,
  }),
)

WIDGETS.lock()