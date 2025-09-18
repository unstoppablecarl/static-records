import { describe, expect, it } from 'vitest'
import { deepFreeze } from '../../src/frozenLocker'
import { recordTypeKey } from '../../src'

describe('deepFreeze() unit tests', () => {
  it('freezable types', () => {
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

    expect(obj).toBeFrozen(true)
    expect(child1).toBeFrozen(true)
    expect(child2).toBeFrozen(true)
    expect(grandChild).toBeFrozen(true)
    expect(func).toBeFrozen(true)
    expect(closure).toBeFrozen(true)
    expect(arrItem1).toBeFrozen(true)
    expect(arrItem2).toBeFrozen(true)

    expect(child1).toBeFrozen(true)
    expect(child2).toBeFrozen(true)
    expect(child1.grandChild).toBeFrozen(true)
  })

  it('traverse child objects that are not frozen and are not static records', () => {
    const child = {
      name: 'rec2',
      value: { foo: 'bar' },
    }

    const record = {
      name: 'record',
      child,
      [recordTypeKey]: 'REC3',
    }

    deepFreeze(record)

    expect(record).toBeFrozen(true)
    expect(child).toBeFrozen(true)
    expect(child.value).toBeFrozen(true)
  })

  it('do not traverse child static records that are not frozen', () => {
    const child = {
      name: 'rec2',
      value: { foo: 'bar' },
      [recordTypeKey]: 'REC2',
    }

    const record = {
      name: 'record',
      child,
      [recordTypeKey]: 'REC3',
    }

    deepFreeze(record)

    expect(record).toBeFrozen(true)
    expect(child).toBeFrozen(false)
    expect(child.value).toBeFrozen(false)
  })

  it('do not traverse child static records even if they are frozen', () => {
    const case1 = Object.freeze({
      name: 'rec2',
      value: { foo: 'bar' },
      [recordTypeKey]: 'REC2',
    })

    const record = {
      name: 'record',
      case1,
      [recordTypeKey]: 'REC3',
    }

    deepFreeze(record)

    expect(record).toBeFrozen(true)
    expect(case1).toBeFrozen(true)
    expect(case1.value).toBeFrozen(false)
  })

  it('do not traverse already frozen objects that are not records', () => {
    const child = Object.freeze({
      name: 'rec2',
      value: { foo: 'bar' },
    })

    const record = {
      name: 'record',
      child,
      [recordTypeKey]: 'REC3',
    }

    deepFreeze(record)

    expect(record).toBeFrozen(true)
    expect(child).toBeFrozen(true)
    expect(child.value).toBeFrozen(false)
  })
})