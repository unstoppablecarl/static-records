import { describe, expect, it } from 'vitest'
import { getRecordType, staticKey } from '../src/staticKey'
import { staticRecords } from '../src/staticRecords'

type ThingInput = {
  baseName: string
}

export class Thing {
  readonly [staticKey]: string

  constructor(public readonly id: string,
              recordType: string,
  ) {
    this[staticKey] = recordType
  }

  readonly name: string = ''

  prefixName(prefix: string) {
    return `${prefix}-${this.name}`
  }
}

const THINGS = staticRecords<Thing, ThingInput>(Thing.name, {
  creator: (id, recordType) => new Thing(id, recordType),
  locker: (item, input) => {
    Object.assign(item, {
      name: input.baseName,
    })
  },
})

const FOO = THINGS.define(
  'FOO',
  () => ({
    baseName: 'Foo',
  }),
)

THINGS.lock()

describe('staticRecords() options class', async () => {
  it('basic class', async () => {
    expect(getRecordType(FOO)).toEqual('Thing')

    expect(FOO).toEqual({
      id: 'FOO',
      name: 'Foo',
      [staticKey]: 'Thing',
    })
    expect(FOO).instanceof(Thing)
    expect(FOO.prefixName('something')).toBe('something-Foo')
  })
})