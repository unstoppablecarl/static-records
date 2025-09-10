import { describe, expect, it } from 'vitest'
import { deepFreeze } from '../src/deepFreeze'
import { recordTypeKey } from '../src'

describe('deepFreeze() unit tests', async () => {
  function func() {
  }

  const closure = () => {
  }

  const arrItem1 = { id: 1 }
  const arrItem2 = { id: 2 }

  const grandChild = {
    name: 'jim',
  }

  type Child = {
    name: string,
    sibling?: Child,
    grandChild?: object,
  }
  const child1: Child = {
    name: 'c1',
    grandChild,
  }

  const child2 = {
    name: 'c2',
    sibling: child1,
  }

  child1.sibling = child2

  const otherRecord = {
    [recordTypeKey]: 'Thing',
    child: {
      foo: 'bar',
    },
  }

  const obj = {
    func,
    closure,
    str: 'string',
    number: 99,
    decimal: 1.04,
    array: [arrItem1, arrItem2],
    child1,
    child2,
    otherRecord,
  }
  deepFreeze(obj)

  it('freezable types', async () => {
    expect(Object.isFrozen(obj)).toBe(true)
    expect(Object.isFrozen(child1)).toBe(true)
    expect(Object.isFrozen(child2)).toBe(true)
    expect(Object.isFrozen(grandChild)).toBe(true)
    expect(Object.isFrozen(func)).toBe(true)
    expect(Object.isFrozen(closure)).toBe(true)
    expect(Object.isFrozen(arrItem1)).toBe(true)
    expect(Object.isFrozen(arrItem2)).toBe(true)
  })

  it('ignores child objects with [recordTypeKey]', async () => {
    expect(Object.isFrozen(otherRecord)).toBe(false)
    expect(Object.isFrozen(otherRecord.child)).toBe(false)
  })

  it('circular reference', async () => {
    expect(Object.isFrozen(child1)).toBe(true)
    expect(Object.isFrozen(child2)).toBe(true)
    expect(Object.isFrozen(child1.grandChild)).toBe(true)
  })
})