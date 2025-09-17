import { lazy, makeLazyFiller, staticRecords } from '../../src'
import type { TestCase } from '../types'

type ArmorVariant = {
  readonly id: string,
  readonly name: string,
  readonly stat: number,
  readonly fireResistance: number,
}

const ARMOR_VARIANTS = staticRecords<ArmorVariant>('ArmorVariant', {
  filler: makeLazyFiller(),
})

const FIRE_RESISTANT = ARMOR_VARIANTS.define(
  'FIRE_RESISTANT',
  () => ({
    name: 'Fire Resistant',
    stat: 0,
    fireResistance: 3,
  }),
)

ARMOR_VARIANTS.lock()

type Armor = {
  readonly id: string,
  readonly name: string,
  readonly stat: number,
  readonly fireResistance: number,
}

const ARMOR = staticRecords<Armor>('Armor', {
  filler: makeLazyFiller(),
})

const FIRE_RESISTANT_LEATHER = ARMOR.define(
  'FIRE_RESISTANT_LEATHER',
  () => makeVariant(LEATHER, FIRE_RESISTANT),
)

const LEATHER = ARMOR.define(
  'LEATHER',
  () => ({
    name: 'Leather',
    stat: 1,
    fireResistance: 1,
  }),
)

ARMOR.lock()

function makeVariant(armor: Armor, variant: ArmorVariant) {
  return {
    name: lazy(() => `${variant.name} ${armor.name}`) as string,
    stat: lazy(() => armor.stat + variant.stat) as number,
    fireResistance: lazy(() => armor.fireResistance + variant.fireResistance) as number,
  }
}

export const TESTS: TestCase[] = [
  {
    key: 'FIRE_RESISTANT_LEATHER.id',
    actual: FIRE_RESISTANT_LEATHER.id,
    expected: 'FIRE_RESISTANT_LEATHER',
  },
  {
    key: 'FIRE_RESISTANT_LEATHER.name',
    actual: FIRE_RESISTANT_LEATHER.name,
    expected: 'Fire Resistant Leather',
  },
  {
    key: 'FIRE_RESISTANT_LEATHER.stat',
    actual: FIRE_RESISTANT_LEATHER.stat,
    expected: 1,
  },
  {
    key: 'FIRE_RESISTANT_LEATHER.stat',
    actual: FIRE_RESISTANT_LEATHER.fireResistance,
    expected: 4,
  },
]