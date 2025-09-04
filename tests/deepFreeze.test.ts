import { describe, expect, it } from 'vitest'
import { deepFreeze } from '../src/deepFreeze'

describe('deepFreeze() unit tests', async () => {
  it('circular reference', async () => {

    function func() {

    }

    const closure = () => {}

    const a: { b: object } = { b: {} }

    const b = {
      a,
    }

    a.b = b

    const arrItem1 = {id: 1}
    const arrItem2 = {id: 2}

    const f = {
      a,
      func: func,
      closure,
      str: 'string',
      number: 99,
      decimal: 1.04,
      array: [arrItem1, arrItem2],
    }

    deepFreeze(f)

    expect(Object.isFrozen(f)).toBe(true)
    expect(Object.isFrozen(a)).toBe(true)
    expect(Object.isFrozen(b)).toBe(true)
    expect(Object.isFrozen(func)).toBe(true)
    expect(Object.isFrozen(closure)).toBe(true)
    expect(Object.isFrozen(arrItem1)).toBe(true)
    expect(Object.isFrozen(arrItem2)).toBe(true)

  })
})