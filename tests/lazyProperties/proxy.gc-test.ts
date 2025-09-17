import { describe, expect, it } from 'vitest'
import { type HasParent, lazyTree, makeLazyFiller, recordTypeKey, staticRecords } from '../../src'

// Helper to run test with proper Node.js flags
if (typeof global !== 'undefined' && !global.gc) {
  console.warn('⚠️  Run tests with: node --expose-gc ./node_modules/.bin/vitest')
  console.warn('   Or add to package.json: "test:gc": "node --expose-gc ./node_modules/.bin/vitest"')
}

describe('Proxy collect-ability tests', () => {
  const registry: string[] = []
  const finalizer = new FinalizationRegistry((tag: string) => {
    console.log(`Object finalized: ${tag}`)
    registry.push(tag)
  })

  it('temp object should be collectable', async () => {

    const RECORDS = staticRecords('Record', {
      filler: makeLazyFiller(),
    })

    const DAN = RECORDS.define('DAN', () => ({
      name: 'Dan',
      rootName: 'Danny',
      meta: lazyTree((parent1: HasParent, root1: HasParent) => {
        finalizer.register(parent1, 'parent1')
        finalizer.register(root1, 'root1')

        return {
          rootName: root1.rootName,
          foo: lazyTree((parent2: HasParent, root2: HasParent) => {
            finalizer.register(parent2, 'parent2')
            finalizer.register(root2, 'root2')

            return {
              parentName: parent2?.parent?.name,
              rootName: root2.rootName,
              some: 'thing',
            }
          }),
        }
      }),
    }))

    RECORDS.lock()

    expect(DAN).toEqual({
      id: 'DAN',
      name: 'Dan',
      rootName: 'Danny',
      meta: {
        rootName: 'Danny',
        foo: {
          parentName: 'Dan',
          rootName: 'Danny',
          some: 'thing',
        },
      },
      [recordTypeKey]: 'Record',
    })

    // try to force gc
    if (global.gc) {
      addMemoryPressure()
      // Multiple GC cycles with delays
      for (let i = 0; i < 5; i++) {
        global.gc()
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      addMemoryPressure()
      global.gc()
    } else {
      throw new Error('gc not available - run with --expose-gc')
    }

    await watchRegistryKeys(registry, [
      'parent1',
      'parent2',
      'root1',
      'root2',
    ])

    expect(registry.sort()).toEqual([
      'parent1',
      'parent2',
      'root1',
      'root2',
    ].sort())
  })
})

function watchRegistryKeys(registry: string[], keys: string[]) {
  return Promise.all(keys.map(key => watchRegistryKey(registry, key)))
}

function watchRegistryKey(registry: string[], key: string) {
  return new Promise((resolve) => {
    const start = Date.now()
    const maxWait = 5000

    const check = () => {
      const elapsed = Date.now() - start

      if (registry.includes(key)) {
        console.log(`✅ ${key} Object collected after ${elapsed}ms`)
        resolve(null)
      } else if (elapsed > maxWait) {
        console.log(`⚠️ ${key} Timeout reached after ${elapsed}ms`)
        resolve(null)
      } else {
        // Check more frequently initially, then less frequently
        const delay = elapsed < 1000 ? 50 : 200
        setTimeout(check, delay)
      }
    }

    check()
  })
}

function addMemoryPressure() {
  const arrays = []
  // Create multiple large arrays to force GC
  for (let round = 0; round < 5; round++) {
    const arr = []
    for (let i = 0; i < 200000; i++) {
      arr.push({ data: Math.random(), round })
    }
    arrays.push(arr)
  }
  // Return something to prevent optimization
  return arrays.length
}