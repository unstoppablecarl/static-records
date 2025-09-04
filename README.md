# Static Records

Static immutable relational data for js.

## Installation

`$ npm i static-records`

## Primary Use Case

When defining relational immutable static data. Specifically when it has circular references or references in the same file out of order.

`person-data.ts`

```ts
import { staticRecords } from 'static-records'

export type Person = {
  id: string;
  name: string;
  manager: Person | null;
  emergency_contact: Person | null;
}

type PersonNoId = Omit<Person, 'id'>

export const PEOPLE = staticRecords<Person>(/* Record Type Name: */ 'Person')

export const JIM = PEOPLE.define(
  'JIM', // id property
  (): PersonNoId => ({
    name: 'Jim',
    manager: SUE,
    emergency_contact: null,
  }),
)

export const SUE = PEOPLE.define(
  'SUE', // id property
  (): PersonNoId => ({
    name: 'Sue',
    manager: null,
    emergency_contact: JIM,
  }),
)
// locks the data with Object.freeze()
PEOPLE.lock()
```

`vehicle-data.ts`

```ts
import { staticRecords } from 'static-records'

import { JIM, SUE } from './person-data'

export type Vehicle = {
  id: string,
  name: string,
  driver: Person,
  passengers: Person[],
}
type VehicleNoId = Omit<Vehicle, 'id'>

export const VEHICLES = staticRecords<Vehicle>(/* Record Type Name: */ 'Vehicle')

export const CAR = VEHICLES.define(
  'CAR',
  (): VehicleNoId => ({
    name: 'Car',
    driver: SUE,
  }),
)
export const VAN = VEHICLES.define(
  'VAN',
  (): VehicleNoId => ({
    name: 'Van',
    driver: JIM,
    passengers: [SUE],
  }),
)

VEHICLES.lock()
```

`somewhere.ts`

```ts
import { JIM } from './person-data'
import { CAR } from './vehicle-data'
import { getRecordType } from 'static-records'

JIM.id // 'JIM'
JIM.name // 'Jim'
JIM.manager // SUE
JIM.emergency_contact // null

getRecordType(JIM) // 'Person'

CAR.id // 'CAR'
CAR.name // 'Car'
CAR.driver // SUE,
CAR.passengers // []
```

## API

```ts
import { staticRecords } from 'static-records'

type Contact = {
  name: string;
};
export const CONTACTS = staticRecords<Contact>('Contact')

export const JIM = CONTACTS.define(
  'JIM',
  (): VehicleNoId => ({
    name: 'Car',
  }),
)

// always lock before using
CONTACTS.lock()

CONTACTS.get('JIM') // JIM
CONTACTS.has('JIM') // true
CONTACTS.toArray() // [JIM]
CONTACTS.toObject() // {"JIM": JIM}

CONTACTS.forEach((item: Contact) => {})
CONTACTS.map((item: Contact) => {})
CONTACTS.filter((item: Contact) => {})
```

## Custom DeepFreeze
You can use a custom `deepFreeze` function if needed.

```ts
import { staticRecords, isStaticRecord } from 'static-records'

function customDeepFreeze<T extends Record<string | symbol, any>>(object: T): T {
  const propNames = Reflect.ownKeys(object)
  Object.freeze(object)
  for (const name of propNames) {
    const value = object[name]
    const type = typeof value
    if ((type === 'object' || type === 'function') &&
      !Object.isFrozen(value) &&
      !value.isSpecial &&
      isStaticRecord(value)
    ) {
      deepFreeze(value)
    }
  }
  return object
}

export const CONTACTS = staticRecords<Contact>('Contact', {deepFreeze: customDeepFreeze})
```
If you want to disable the deep freeze you can do:

```ts
export const CONTACTS = staticRecords<Contact>('Contact', { deepFreeze: (input) => input })


```

## Building

`$ pnpm install`
`$ pnpm run build`

## Testing

`$ pnpm run test`
`$ pnpm run test:mutation`

## Releases Automation

- update `package.json` file version (example: `1.0.99`)
- manually create a github release with a tag matching the `package.json` version prefixed with `v` (example: `v1.0.99`)
- npm should be updated automatically
