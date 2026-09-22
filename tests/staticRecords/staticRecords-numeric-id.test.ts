import { describe, expect, it } from 'vitest'
import { recordTypeKey } from '../../src/recordType'
import { staticRecords } from '../../src/staticRecords'

// numeric ids are opt-in via a custom Item/ProtoItem - DefaultProtoItem
// itself stays string-only (see staticRecords-types.test.ts)
type Widget = {
  readonly id: number,
  readonly name: string,
}
type ProtoWidget = {
  readonly id: number,
  readonly [recordTypeKey]: string,
}

describe('staticRecords() numeric id', async () => {
  const WIDGETS = staticRecords<Widget, ProtoWidget>('WIDGET', {
    creator: (id, recordType) => ({ id, [recordTypeKey]: recordType }),
  })

  const ONE = WIDGETS.define(1, () => ({ name: 'One' }))
  const TWO = WIDGETS.define(2, () => ({ name: 'Two' }))

  WIDGETS.lock()

  it('fills records defined with a numeric id', () => {
    expect(ONE).toEqual({ id: 1, name: 'One', [recordTypeKey]: 'WIDGET' })
    expect(TWO).toEqual({ id: 2, name: 'Two', [recordTypeKey]: 'WIDGET' })
  })

  it('.get() finds records by numeric id', () => {
    expect(WIDGETS.get(1)).toBe(ONE)
    expect(WIDGETS.get(2)).toBe(TWO)
  })

  it('.has() finds records by numeric id', () => {
    expect(WIDGETS.has(1)).toBe(true)
    expect(WIDGETS.has(3)).toBe(false)
  })

  it('.toArray() / .toObject() include numeric-id records', () => {
    expect(WIDGETS.toArray()).toEqual([ONE, TWO])
    expect(WIDGETS.toObject()).toEqual({ 1: ONE, 2: TWO })
  })

  it('does not confuse a numeric id with its string form', () => {
    const OTHER = staticRecords<Widget, ProtoWidget>('OTHER_WIDGET', {
      creator: (id, recordType) => ({ id, [recordTypeKey]: recordType }),
    })

    OTHER.define(1, () => ({ name: 'One' }))
    expect(() => OTHER.lock()).not.toThrow()
  })

  it('lock() tolerates a misbehaving creator that returns a different id than it was given', () => {
    // defensive regression test, not a supported pattern: a creator is
    // expected to keep item.id equal to the id define() was called with.
    // lock()'s definer lookup must not rely on that holding - it's keyed by
    // the id passed to define(), so even a buggy creator that violates the
    // contract can't take lock() down with a confusing "definer is not a
    // function" error.
    const BUGGY = staticRecords<Widget, ProtoWidget>('BUGGY_WIDGET', {
      creator: (id, recordType) => ({ id: id + 1000, [recordTypeKey]: recordType }),
    })

    const item = BUGGY.define(1, () => ({ name: 'Oops' }))

    expect(() => BUGGY.lock()).not.toThrow()
    expect(item).toEqual({ id: 1001, name: 'Oops', [recordTypeKey]: 'BUGGY_WIDGET' })
  })
})
