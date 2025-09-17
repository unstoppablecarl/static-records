import { type Lazy, lazy, lazyFrozenFiller, staticRecords } from '../../../src'
import { CAR } from './frozen-vehicles-data'

type Driver = {
  id: string,
  name: string,
  age: number,
  carName: string,
}

type DriverInput = {
  name: string,
  age: number,
  carName: Lazy<string>
}

export const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
  freezer: false,
  filler: lazyFrozenFiller,
})
export const DAN = DRIVERS.define(
  'DAN',
  () => ({
    name: 'Dan',
    age: 20,
    carName: lazy(() => {
      return CAR.name
    }),
  }),
)

export const LISA = DRIVERS.define(
  'LISA',
  () => ({
    name: 'Lisa',
    age: 17,
    carName: lazy(() => {
      return CAR.name
    }),
  }),
)
DRIVERS.lock()