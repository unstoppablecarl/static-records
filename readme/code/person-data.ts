import { staticRecords } from '../../src'

export type Person = {
  readonly id: string;
  readonly name: string;
  readonly manager: Person | null;
  readonly emergencyContact: Person | null;
}

export const PEOPLE = staticRecords<Person>(/* Record Type Name: */ 'Person')

export const JIM = PEOPLE.define(
  'JIM', // id property
  () => ({
    name: 'Jim',
    manager: SUE,
    emergencyContact: null,
  }),
)

export const SUE = PEOPLE.define(
  'SUE', // id property
  () => ({
    name: 'Sue',
    manager: null,
    emergencyContact: JIM,
  }),
)
// locks the data with deep Object.freeze()
PEOPLE.lock()