import { staticRecords } from '../../src'
import type { Optional } from './helpers'
import { VAN, type Vehicle } from './vehicles'

export type Person = {
  id: string,
  name: string,
  passenger: Person | null,
  emergency_contact: Person | null,
  has_coffee: boolean,
  preferred_vehicle: Vehicle | null,
}

type PersonNoId = Omit<Person, 'id'>
export const PEOPLE = staticRecords<Person>('PERSON')

export const JIM = PEOPLE.define(
  'JIM',
  () => makePerson({
    name: 'Jim',
    passenger: SUE,
  }),
)

export const SUE = PEOPLE.define(
  'SUE',
  () => makePerson({
    name: 'Sue',
    has_coffee: true,
    emergency_contact: JIM,
    preferred_vehicle: VAN,
  }),
)

PEOPLE.lock()

function makePerson(input: Optional<PersonNoId, 'passenger' | 'emergency_contact' | 'has_coffee' | 'preferred_vehicle'>): PersonNoId {
  return {
    passenger: null,
    emergency_contact: null,
    preferred_vehicle: null,
    has_coffee: false,
    ...input,
  }
}