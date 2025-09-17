import { lazy, type Lazy, makeLazyFiller, staticRecords } from '../../../src'
import { DAN } from './frozen-drivers-data'

type Vehicle = {
  id: string,
  name: string,
  driverName: string,
  driverIsAdult: boolean,
}

type VehicleInput = {
  name: string,
  driverName?: Lazy<string>,
  driverIsAdult?: Lazy<boolean>,
}

export const VEHICLES = staticRecords<Vehicle, never, VehicleInput>('VEHICLE', {
  filler: makeLazyFiller({ freeze: true }),
})

export const CAR = VEHICLES.define(
  'CAR',
  () => ({
    name: 'Car',
    // doesn't actually need to be lazy
    driverName: lazy(() => {
      return DAN.name
    }),
    driverIsAdult: lazy(() => {
      return DAN.age > 18
    }),
  }),
)
VEHICLES.lock()