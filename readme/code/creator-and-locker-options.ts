import { recordTypeKey, staticRecords } from '../../src'

type Widget = {
  readonly id: string,
  readonly name: string
}

type ProtoWidget = {
  readonly id: string,
  readonly [recordTypeKey]: string
}

const WIDGETS = staticRecords<Widget>('Widget', {
  // creates initial object with id and recordType
  // default implementation shown
  creator: (id: string, recordType: string): ProtoWidget => {
    return {
      id,
      [recordTypeKey]: recordType,
    }
  },
  // populates existing item with data before it is locked
  // default implementation shown
  filler: (
    // item is the object returned by the creator function
    item: ProtoWidget,
    // input is the object returned by the factory function passed to WIDGETS.define('MY_ID', () => input)
    // the type is determined by the second type argument passed to staticRecords()
    // the default input type is shown here
    input: Omit<Widget, 'id' | typeof recordTypeKey>,
  ) => {
    // typescript doesn't check readonly when using Object.assign()
    // inside this function the object is still being created
    // so readonly should not be checked yet
    Object.assign(item, input)

    // this function must mutate the item object (not create a new one)
    // for object references to work correctly
  },
})

const BOOP = WIDGETS.define(
  'BOOP',
  () => ({
    name: 'Boop',
  }),
)

WIDGETS.lock()