import { recordTypeKey, staticRecords } from '../../src'

// numeric ids are opt-in: supply your own Item/ProtoItem with `id: number`.
// the built-in DefaultProtoItem stays string-only, so nothing changes for
// existing string-id record types that don't customize ProtoItem
type Widget = {
  readonly id: number,
  readonly name: string
}

type ProtoWidget = {
  readonly id: number,
  readonly [recordTypeKey]: string
}

const WIDGETS = staticRecords<Widget, ProtoWidget>('Widget', {
  // creates initial object with id and recordType
  // default implementation shown, but typed for a numeric id
  creator: (id: number, recordType: string): ProtoWidget => {
    return {
      id,
      // the recordTypeKey symbol is used by the
      // getRecordType() function
      // and the frozenLocker() function to determine
      // which objects are static records
      [recordTypeKey]: recordType,
    }
  },
  // populates existing item with data before it is locked
  // default implementation shown
  filler: (
    // item is the object returned by the creator function
    item: ProtoWidget,
    // input is the object returned by the factory function passed to WIDGETS.define(1, () => input)
    // the type is determined by the second type argument passed to staticRecords()
    // the default input type is shown here
    input: Omit<Widget, 'id' | typeof recordTypeKey>,
  ) => {
    // typescript doesn't check readonly when using Object.assign()
    // inside this function the object is still being created
    // so readonly should not be checked yet
    // type safety is maintained by the Widget type anyway
    Object.assign(item, input)

    // this function must mutate the item object (not create a new one)
    // for object references to work correctly
  },
})

const BOOP = WIDGETS.define(
  1,
  () => ({
    name: 'Boop',
  }),
)

WIDGETS.lock()
