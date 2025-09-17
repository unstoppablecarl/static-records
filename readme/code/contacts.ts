import { staticRecords } from '../../src'
import type { TestCase } from '../types'

type Contact = {
  readonly id: string,
  readonly name: string;
};

export const CONTACTS = staticRecords<Contact>('Contact')

export const JIM = CONTACTS.define(
  'JIM',
  () => ({
    name: 'Car',
  }),
)

CONTACTS.locked() // false

// always lock before using
CONTACTS.lock()

CONTACTS.locked() // true
export const TESTS: TestCase[] = [
  {
    key: `CONTACTS.get('JIM')`,
    actual: CONTACTS.get('JIM'),
    expected: JIM,
    expected_as_string: 'JIM',
  },
  {
    key: `CONTACTS.has('JIM')`,
    actual: CONTACTS.has('JIM'),
    expected: true,
  },
  {
    key: `CONTACTS.toArray()`,
    actual: CONTACTS.toArray(),
    expected: [JIM],
    expected_as_string: `[JIM]`,
    exact: false,
  },
  {
    key: `CONTACTS.toObject()`,
    actual: CONTACTS.toObject(),
    expected: { JIM },
    expected_as_string: `{"JIM": JIM}`,
    exact: false,
  },
]