import { describe, expect, it } from 'vitest'
import { deepFreeze } from '../../src/frozenLocker'
import { recordTypeKey } from '../../src'

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
    expect(obj).toBeFrozen(true)
    expect(child1).toBeFrozen(true)
    expect(child2).toBeFrozen(true)
    expect(grandChild).toBeFrozen(true)
    expect(func).toBeFrozen(true)
    expect(closure).toBeFrozen(true)
    expect(arrItem1).toBeFrozen(true)
    expect(arrItem2).toBeFrozen(true)
  })

  it('ignores child objects with [recordTypeKey]', async () => {
    expect(otherRecord).toBeFrozen(false)
    expect(otherRecord.child).toBeFrozen(false)
  })

  it('circular reference', async () => {
    expect(child1).toBeFrozen(true)
    expect(child2).toBeFrozen(true)
    expect(child1.grandChild).toBeFrozen(true)
  })
})