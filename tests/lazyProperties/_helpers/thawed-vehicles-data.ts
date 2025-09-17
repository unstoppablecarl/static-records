import { lazy, type Lazy, lazyFiller, staticRecords } from '../../../src'
import { DAN } from './thawed-drivers-data'

type Vehicle = {
  id: string,
  name: string,
  driverName?: string,
}

type VehicleInput = {
  name: string,
  driverName?: Lazy<string>,
}

export const VEHICLES = staticRecords<Vehicle, never, VehicleInput>('VEHICLE', {
  freezer: false,
  filler: lazyFiller,
})

export const CAR = VEHICLES.define(
  'CAR',
  () => ({
    name: 'Car',
    // doesn't actually need to be lazy
    driverName: lazy(() => {
      return DAN.name
    }),
  }),
)
VEHICLES.lock()