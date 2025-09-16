import { describe, expect, it, vi } from 'vitest'
import { makeProxy, PROXY_KEY } from '../../src/lazyProperties/proxy'

describe('makeProxy', () => {
  it('normal', () => {
    const target = {
      foo: 'bar',
    }
    const parent = {
      name: 'susan',
    }
    const proxy = makeProxy(target, parent, 'parentProp', 'something', 'parentKey')

    expect(proxy.parentKey).toBe(parent)
    expect(proxy.foo).toBe('bar')
    expect(Object.keys(proxy)).toEqual([
      'parentKey',
      'foo',
    ])
    expect('parentKey' in proxy).toBe(true)
    expect('foo' in proxy).toBe(true)

    expect(proxy[PROXY_KEY]).toBe('something.parentProp')
    expect(PROXY_KEY in proxy).toBe(true)
  })

  it('without parentKey', () => {
    const target = {
      foo: 'bar',
    }
    const parent = {
      name: 'susan',
    }
    const proxy = makeProxy(target, parent, 'parentProp', 'something', null)

    expect(proxy.parentKey).toBe(undefined)
    expect(proxy.foo).toBe('bar')
    expect(Object.keys(proxy)).toEqual([
      'foo',
    ])
    expect('parentKey' in proxy).toBe(false)
    expect('foo' in proxy).toBe(true)

    expect(proxy[PROXY_KEY]).toBe('something.parentProp')
    expect(PROXY_KEY in proxy).toBe(true)
  })

  it('normal', () => {
    vi.stubGlobal('__DEV__', false)

    const target = {
      foo: 'bar',
    }
    const parent = {
      name: 'susan',
    }
    const proxy = makeProxy(target, parent, 'parentProp', 'something', 'parentKey')

    expect(proxy.parentKey).toBe(parent)
    expect(proxy.foo).toBe('bar')
    expect(Object.keys(proxy)).toEqual([
      'parentKey',
      'foo',
    ])
    expect('parentKey' in proxy).toBe(true)
    expect('foo' in proxy).toBe(true)

    expect(proxy[PROXY_KEY]).toBe(undefined)
    expect(PROXY_KEY in proxy).toBe(false)
  })

  it('defaults', () => {

    const target = {
      foo: 'bar',
    }
    const parent = {
      name: 'susan',
    }
    const proxy = makeProxy(target, parent, 'parentProp', 'proxyType', 'parent')

    expect(proxy.parent).toBe(parent)
    expect(proxy.foo).toBe('bar')
    expect(Object.keys(proxy)).toEqual([
      'parent',
      'foo',
    ])
    expect('parent' in proxy).toBe(true)
    expect('foo' in proxy).toBe(true)

    expect(proxy[PROXY_KEY]).toBe('proxyType.parentProp')
    expect(PROXY_KEY in proxy).toBe(true)
  })
})