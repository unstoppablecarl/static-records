import { staticRecords } from '../../src'

export type Person = {
  id: string;
  name: string;
  manager: Person | null;
  emergency_contact: Person | null;
}

export const PEOPLE = staticRecords<Person>(/* Record Type Name: */ 'Person')

export const JIM = PEOPLE.define(
  'JIM', // id property
  () => {
    return {
      name: 'Jim',
      manager: SUE,
      emergency_contact: null,
    }
  },
)

export const SUE = PEOPLE.define(
  'SUE', // id property
  () => ({
    name: 'Sue',
    manager: null,
    emergency_contact: JIM,
  }),
)
// locks the data with deep Object.freeze()
PEOPLE.lock()