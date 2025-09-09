import { staticRecords } from '../../src'
import type { TestCase } from '../types'

type Tire = {
  id: string,
  name: string;
  brand: string,
};

export const TIRES = staticRecords<Tire>('Tire')

export const ECONOMY = TIRES.define(
  'ECONOMY',
  () => makeTire({
    name: 'Economy',
  }),
)

export const PERFORMANCE = TIRES.define(
  'PERFORMANCE',
  () => makeTire({
    name: 'Performance',
    brand: 'goodyear',
  }),
)

TIRES.lock()

function makeTire(input: {
  name: string,
  brand?: string,
}): Omit<Tire, 'id'> {
  return {
    brand: 'generic',
    ...input,
  }
}

export const TESTS: TestCase[] = [
  {
    key: 'ECONOMY.id',
    actual: ECONOMY.id,
    expected: 'ECONOMY',
  },
  {
    key: 'ECONOMY.name',
    actual: ECONOMY.name,
    expected: 'Economy',
  },
  {
    key: 'ECONOMY.brand',
    actual: ECONOMY.brand,
    expected: 'generic',
  },

  {
    key: 'PERFORMANCE.id',
    actual: PERFORMANCE.id,
    expected: 'PERFORMANCE',
  },
  {
    key: 'PERFORMANCE.name',
    actual: PERFORMANCE.name,
    expected: 'Performance',
  },
  {
    key: 'PERFORMANCE.brand',
    actual: PERFORMANCE.brand,
    expected: 'goodyear',
  },
]