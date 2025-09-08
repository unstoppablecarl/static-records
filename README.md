# Static Records

A tiny package for static immutable js data.

**Supports**
 - Circular references
 - Out of order definitions

## Installation

`$ npm i static-records`

## Example

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
// locks the data with deep Object.freeze()
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

`use-example.ts`

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

CONTACTS.locked() // false

// always lock before using
CONTACTS.lock()

CONTACTS.locked() // true
CONTACTS.get('JIM') // JIM
CONTACTS.has('JIM') // true
CONTACTS.toArray() // [JIM]
CONTACTS.toObject() // {"JIM": JIM}
```

## Freezing
`Object.freeze()` is applied to all records and their children after `lock()` is called.

### Custom Deep Freeze
You can use a custom `deepFreeze` function if needed.

See the [default deepFreeze Implementation](src/deepFreeze.ts)

```ts

// default implementation
function myCustomDeepFreeze(obj) {
  // ...
  return obj
}

export const CONTACTS = staticRecords<Contact>('Contact', { deepFreeze: customDeepFreeze })
```

### Disable Deep Freeze

```ts
export const CONTACTS = staticRecords<Contact>('Contact', { deepFreeze: false })
```

### Creator and Locker Options
The `creator` and `locker` options allow deeper control over object creation.

```ts
import { staticRecords, recordTypeKey } from 'static-records'

type Widget = {
  id: string,
  name: string
}

const WIDGETS = staticRecords<Widget>('Widget', {
  // default implementation
  creator: (id: string, recordType: string) => {
    return {
      id,
      [recordTypeKey]: recordType,
    }
  },
  // default implementation
  locker: (item, input) => {
    Object.assign(item, input)
  },
})
```

#### Using Classes 
Static Records can be class instances instead of generic objects.
```ts
import { staticRecords, recordTypeKey } from 'static-records'

type SellerInput = {
  firstName?: string,
  lastName?: string,
}

export class Seller {
  readonly [recordTypeKey]: string
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  
  constructor(
    id: string,
    recordType: string,
  ) {
    this.id = id
    this[recordTypeKey] = recordType
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

const SELLERS = staticRecords<Seller, SellerInput>(Seller.name, {
  creator: (id, recordType) => new Thing(id, recordType),
  locker: (item, input) => {
    Object.assign(item, {
      firstName: input.firstName ?? 'unknown',
      lastName: input.lastName ?? 'unknown',
    })
  },
})

const SAM = SELLERS.define(
  'SAM',
  () => ({
    firstName: 'Samuel',
  }),
)

SELLERS.lock()

SAM.firstName // 'Samuel'
SAM.lastName // 'unknown'
SAM.fullName() // 'Samuel unknown'
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
