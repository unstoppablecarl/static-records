import { JIM, type Person } from './people'
import { staticRecords } from '../../src'

import type { Optional } from '../../src/type-util'

export type Vehicle = {
  id: string,
  name: string,
  drivers: Person[],
  cup_holder_required: boolean,
  backup_vehicle: Vehicle | null,
}
type VehicleNoId = Omit<Vehicle, 'id'>

export const VEHICLES = staticRecords<Vehicle>('VEHICLE')

export const CAR = VEHICLES.define(
  'CAR',
  () => makeVehicle({
    name: 'Car',
    backup_vehicle: VAN,
  }),
)
export const VAN = VEHICLES.define(
  'VAN',
  () => makeVehicle({
    name: 'Van',
    drivers: [
      JIM,
    ],
  }),
)

VEHICLES.lock()

function makeVehicle(input: Optional<VehicleNoId, 'drivers' | 'cup_holder_required' | 'backup_vehicle'>): VehicleNoId {
  const cup_holder_required = !!input.drivers?.find(person => {
    return person.has_coffee || person.passenger?.has_coffee
  })

  return {
    drivers: [],
    backup_vehicle: null,
    cup_holder_required,
    ...input,
  }
}