# Static Records

A tiny package for static immutable js data.

**Supports**

- Circular references
- Out of order definitions

Useful for: configuration data, reference data, game data, or any scenario where you need immutable, interconnected
objects defined at runtime.

## Installation

`$ npm i static-records`

## Example

<!-- doc-gen CODE src="./readme/code/person-data.ts" showFileName=true -->
`person-data.ts`
```ts
import { staticRecords } from 'static-records'

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
```
<!-- end-doc-gen -->

<!-- doc-gen CODE src="./readme/code/vehicle-data.ts" showFileName=true -->
`vehicle-data.ts`
```ts
import { staticRecords } from 'static-records'

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
```
<!-- end-doc-gen -->

<!-- doc-gen CODE src="./readme/code/use-example.ts" test=true showFileName=true -->
`use-example.ts`
```ts
import { JIM } from './person-data'
import { CAR } from './vehicle-data'
import { getRecordType } from 'static-records'

JIM.id // 'JIM'
JIM.name // 'Jim'
JIM.manager?.id // 'SUE'
JIM.emergency_contact // null
getRecordType(JIM) // 'Person'
CAR.id // 'CAR'
CAR.name // 'Car'
CAR.driver.id // 'SUE'
```
<!-- end-doc-gen -->

## API Reference

<!-- doc-gen CODE src="./readme/code/contacts.ts" test=true -->
```ts
import { staticRecords } from 'static-records'

type Contact = {
  id: string,
  name: string;
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
CONTACTS.get('JIM') // JIM
CONTACTS.has('JIM') // true
CONTACTS.toArray() // [JIM]
CONTACTS.toObject() // {"JIM": JIM}
```
<!-- end-doc-gen -->

## Default Values and Object Composition
Using a factory like `makeTire()` below allows for default values and easy object composition.

<!-- doc-gen CODE src="./readme/code/default-values.ts" test=true -->
```ts
import { staticRecords } from 'static-records'

type Tire = {
  id: string,
  name: string;
  brand: string,
};

export const TIRES = staticRecords<Tire>('Tire')

export const ECONOMY = TIRES.define(
  'ECONOMY',
  () => makeTire({
    name: 'Economy',
  }),
)

export const PERFORMANCE = TIRES.define(
  'PERFORMANCE',
  () => makeTire({
    name: 'Performance',
    brand: 'goodyear',
  }),
)

TIRES.lock()

function makeTire(input: {
  name: string,
  brand?: string,
}): Omit<Tire, 'id'> {
  return {
    brand: 'generic',
    ...input,
  }
}

ECONOMY.id // 'ECONOMY'
ECONOMY.name // 'Economy'
ECONOMY.brand // 'generic'
PERFORMANCE.id // 'PERFORMANCE'
PERFORMANCE.name // 'Performance'
PERFORMANCE.brand // 'goodyear'
```
<!-- end-doc-gen -->

## Freezer Options

`Object.freeze()` is applied to all records and their children after `lock()` is called.

### Custom Deep Freeze

You can use a custom `freezer` function if needed or disable it.
For very large objects you may need to use a non-recursive `freezer` implementation.
You can also disable `freezer` and rely on typescript's readonly modifier.

See the [default freezer](src/deepFreeze.ts)

```ts
function myFreezer(obj) {
  Object.freeze(obj)

  Object.freeze(obj.childObjects).forEach(item => {
    Object.freeze(item)
  })

  return obj
}

export const CONTACTS = staticRecords<Contact>('Contact', { freezer: myFreezer })

// disabled
export const VEHICLES = staticRecords<Contact>('Vehicle', { freezer: false })
```

### Creator and Locker Options
The `creator` and `filler` options allow deeper control over object creation.

<!-- doc-gen CODE src="./readme/code/creator-and-filler-options.ts" -->
```ts
import { recordTypeKey, staticRecords } from 'static-records'

type Widget = {
  readonly id: string,
  readonly name: string
}

type ProtoWidget = {
  readonly id: string,
  readonly [recordTypeKey]: string
}

const WIDGETS = staticRecords<Widget>('Widget', {
  // creates initial object with id and recordType
  // default implementation shown
  creator: (id: string, recordType: string): ProtoWidget => {
    return {
      id,
      // the recordTypeKey symbol is used by the
      // getRecordType() function
      // and the deepFreeze() function to determine
      // which objects are static records
      [recordTypeKey]: recordType,
    }
  },
  // populates existing item with data before it is locked
  // default implementation shown
  filler: (
    // item is the object returned by the creator function
    item: ProtoWidget,
    // input is the object returned by the factory function passed to WIDGETS.define('MY_ID', () => input)
    // the type is determined by the second type argument passed to staticRecords()
    // the default input type is shown here
    input: Omit<Widget, 'id' | typeof recordTypeKey>,
  ) => {
    // typescript doesn't check readonly when using Object.assign()
    // inside this function the object is still being created
    // so readonly should not be checked yet
    // type safety is maintained by the Widget type anyway
    Object.assign(item, input)

    // this function must mutate the item object (not create a new one)
    // for object references to work correctly
  },
})

const BOOP = WIDGETS.define(
  'BOOP',
  () => ({
    name: 'Boop',
  }),
)

WIDGETS.lock()
```
<!-- end-doc-gen -->

#### Using Classes
Static Records can be class instances instead of generic objects.
<!-- doc-gen CODE src="./readme/code/using-classes.ts" test=true -->
```ts
import { type HasId, type HasRecordKey, recordTypeKey, staticRecords } from 'static-records'

// the interfaces HasRecordKey and HasId are not strictly required here
// but BaseItem will need to match their interfaces
class BaseItem implements HasRecordKey, HasId {
  readonly [recordTypeKey]: string

  constructor(
    public readonly id: string,
    recordType: string,
  ) {
    this[recordTypeKey] = recordType
  }
}

// it is not required for Seller to extend BaseItem
// Seller could contain the code from BaseItem instead
export class Seller extends BaseItem {
  declare readonly id: string
  readonly firstName: string = 'unknown'
  readonly lastName: string = 'unknown'

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

type SellerInput = Pick<Seller, 'firstName' | 'lastName'>

const SELLERS = staticRecords<Seller, Seller, SellerInput>(Seller.name, {
  creator: (id: string, recordType: string) => {
    // create the initial object instance
    return new Seller(id, recordType)
  },
})

const SUE = SELLERS.define(
  'SUE',
  // item is the object returned by the creator function
  (item) => makeSeller(item, {
    firstName: 'Susan',
    lastName: 'Smith',
  }),
)

const SAM = SELLERS.define(
  'SAM',
  sellerFactory({
    firstName: 'Samuel',
  }),
)

SELLERS.lock()

function makeSeller(item: Seller, input: {
  firstName?: string,
  lastName?: string,
}): SellerInput {
  const {
    firstName,
    lastName
  } = item

  return {
    // default values from class
    firstName,
    lastName,
    // replace defaults
    ...input,
  }
}

// optionally make a factory for a cleaner api
function sellerFactory(input: {
  firstName?: string,
  lastName?: string,
}) {
  return (item: Seller): SellerInput => makeSeller(item, input)
}

SUE.firstName // 'Susan'
SUE.lastName // 'Smith'
SUE.fullName // 'Susan Smith'
SAM.firstName // 'Samuel'
SAM.lastName // 'unknown'
SAM.fullName // 'Samuel unknown'
SAM instanceof Seller // true
```
<!-- end-doc-gen -->

### Factories and Default Options

A static records factory can be created to set reusable default options.
<!-- doc-gen CODE src="./readme/code/static-records-factory.ts" -->
```ts
import { type DefaultProtoItem, recordTypeKey, staticRecordsFactory } from 'static-records'

export type BaseItem = {
  id: string,
}

type BaseProtoItem = BaseItem & DefaultProtoItem & {
  uid: string,
}

export const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem>({
  creator(id, recordType) {
    return {
      // adding unique id
      uid: `${recordType}-${id}`,
      id,
      [recordTypeKey]: recordType,
    }
  },
  freezer: false,
})
```
<!-- end-doc-gen -->

## Building

`$ pnpm install`

`$ pnpm run build`

`$ pnpm run readme` Injects README.md code examples

## Testing

`$ pnpm run test`

`$ pnpm run test:mutation`

## Releases Automation

- update `package.json` file version (example: `1.0.99`)
- manually create a github release with a tag matching the `package.json` version prefixed with `v` (example: `v1.0.99`)
- npm should be updated automatically
