import { describe, expect, it } from 'vitest'
import { CAR, VAN, type Vehicle } from './vehicles'
import { JIM, type Person, SUE } from './people'

describe('example tests', async () => {
  it('test case 1', async () => {

    expectVehicle(CAR, {
      id: 'CAR',
      name: 'Car',
      cup_holder_required: false,
      backup_vehicle: VAN,
      drivers: [],
    })

    expectPerson(JIM, {
      id: 'JIM',
      name: 'Jim',
      has_coffee: false,
      passenger: SUE,
      emergency_contact: null,
      preferred_vehicle: null,
    })

    expectPerson(SUE, {
      id: 'SUE',
      name: 'Sue',
      has_coffee: true,
      passenger: null,
      emergency_contact: JIM,
      preferred_vehicle: null,
    })

    expectVehicle(VAN, {
      id: 'VAN',
      name: 'Van',
      cup_holder_required: true,
      backup_vehicle: null,
      drivers: [JIM],
    })
  })
})

function expectPerson(person: Person, expected: Person) {
  const {
    id,
    name,
    has_coffee,
    emergency_contact,
  } = person

  expect({
    id,
    name,
    has_coffee,
  }).toEqual({
    id: expected.id,
    name: expected.name,
    has_coffee: expected.has_coffee,
  })

  expect(emergency_contact).toBe(expected.emergency_contact)
}

function expectVehicle(vehicle: Vehicle, expected: Vehicle) {
  const {
    id,
    name,
    drivers,
    cup_holder_required,
  } = vehicle

  expect({
    id,
    name,
    cup_holder_required,
  }).toEqual({
    id: expected.id,
    name: expected.name,
    cup_holder_required: expected.cup_holder_required,
  })

  expect(drivers[0]).toBe(expected.drivers[0])
}