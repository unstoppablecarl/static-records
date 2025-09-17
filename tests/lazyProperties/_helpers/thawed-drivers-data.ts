import { type Lazy, lazy, lazyFiller, staticRecords } from '../../../src'
import { CAR } from './thawed-vehicles-data'

type Driver = {
  id: string,
  name: string,
  carName: string,
}

type DriverInput = {
  name: string,
  carName: Lazy<string>
}

export const DRIVERS = staticRecords<Driver, never, DriverInput>('DRIVER', {
  filler: lazyFiller,
  freezer: false,
})
export const DAN = DRIVERS.define(
  'DAN',
  () => ({
    name: 'Dan',
    carName: lazy(() => {
      return CAR.name
    }),
  }),
)
DRIVERS.lock()