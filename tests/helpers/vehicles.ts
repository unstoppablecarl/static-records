import { type HasId, type StaticRecords } from '../../src'

export function defineAndLockVehicles<T extends HasId & { name: string }>(
  VEHICLES: StaticRecords<T>,
) {
  const CAR = VEHICLES.define(
    'CAR',
    () => ({
      name: 'Car',
    }) as any,
  )

  const VAN = VEHICLES.define(
    'VAN',
    () => ({
      name: 'Van',
    }) as any,
  )

  VEHICLES.lock()

  return {
    CAR,
    VAN,
  }
}
