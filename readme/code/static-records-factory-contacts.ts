import { type BaseItem, makeStaticRecords } from './static-records-factory'
import type { TestCase } from '../types'

type Contact = BaseItem & {
  readonly uid: string,
  readonly id: string,
  readonly name: string;
};

export const CONTACTS = makeStaticRecords<Contact>('Contact')

const JIM = CONTACTS.define(
  'JIM',
  () => ({
    name: 'Jim',
  }),
)

CONTACTS.lock()
export const TESTS: TestCase[] = [
  {
    key: 'JIM.id',
    actual: JIM.id,
    expected: 'JIM',
  },
  {
    key: 'JIM.name',
    actual: JIM.name,
    expected: 'Jim',
  },
  {
    key: 'JIM.uid',
    actual: JIM.uid,
    expected: 'Contact-JIM',
  },
]

