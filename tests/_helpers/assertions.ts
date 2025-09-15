import { expect } from 'vitest'

interface CustomMatchers<R = unknown> {
  toBeFrozen(value: boolean): R;
  toBeExtensible(value: boolean): R;
  toHaveTheSameKeysAs(target: any): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {
  }

  interface AsymmetricMatchersContaining extends CustomMatchers {
  }
}

expect.extend({
  toBeFrozen(received: any, value: boolean) {
    const pass = Object.isFrozen(received) === value
    return {
      message: () => value
        ? `expected Object.isFrozen() to be true`
        : `expected Object.isFrozen() to be false`,
      pass,
    }
  },

  toBeExtensible(received: any, value: boolean) {
    const pass = Object.isExtensible(received) === value
    return {
      message: () => value
        ? `expected Object.isExtensible() to be true`
        : `expected Object.isExtensible() to be false`,
      pass,
    }
  },
  toHaveTheSameKeysAs(received: any, expected: any) {
    const receivedKeys = Object.keys(received).sort()
    const expectedKeys = Object.keys(expected).sort()

    const pass = receivedKeys.length === expectedKeys.length &&
      receivedKeys.every((key, index) => key === expectedKeys[index])

    return {
      pass,
      message: () => pass
        ? `Expected objects not to have same keys`
        : `Expected objects to have same keys. Received: [${receivedKeys.join(', ')}], Expected: [${expectedKeys.join(', ')}]`,
    }
  },
})