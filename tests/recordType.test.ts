import { describe, expect, expectTypeOf, it } from 'vitest'
import { getRecordType, type HasRecordKey, isStaticRecord, recordTypeKey } from '../src'

describe('recordType.ts', async () => {

  it('isStaticRecord() getRecordType() handle non-objects', () => {
    const values = [
      undefined,
      null,
      1,
      'a',
    ]
    values.forEach(val => {
      expect(isStaticRecord(val)).toBe(false)
      expect(getRecordType(val)).toBe(undefined)
    })
  })

  it('isStaticRecord() getRecordType() valid objects', () => {

    const target = {
      [recordTypeKey]: 'foo',
    } as HasRecordKey

    expectTypeOf(target).toEqualTypeOf<HasRecordKey>()
    expect(isStaticRecord(target)).toBe(true)
    expect(getRecordType(target)).toBe('foo')
  })
})