import { staticRecords } from '../../src'

import { JIM, type Person, SUE } from './person-data'

export type Vehicle = {
  id: string,
  name: string,
  driver: Person,
  passengers?: Person[],
}

export const VEHICLES = staticRecords<Vehicle>(/* Record Type Name: */ 'Vehicle')

export const CAR = VEHICLES.define(
  'CAR',
  () => ({
    name: 'Car',
    driver: SUE,
    passengers: [],
  }),
)
export const VAN = VEHICLES.define(
  'VAN',
  () => ({
    name: 'Van',
    driver: JIM,
    passengers: [SUE],
  }),
)

VEHICLES.lock()