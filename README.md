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
// creates the records
// no more records can be defined after this
PEOPLE.lock()
```
<!-- end-doc-gen -->

<!-- doc-gen CODE src="./readme/code/vehicle-data.ts" showFileName=true -->
`vehicle-data.ts`
```ts
import { staticRecords } from 'static-records'

import { JIM, type Person, SUE } from './person-data'

export type Vehicle = {
  readonly id: string,
  readonly name: string,
  readonly driver: Person,
  readonly passengers?: Person[],
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
JIM.emergencyContact // null
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
  readonly id: string,
  readonly name: string;
  readonly brand: string,
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

### Static Record Options
The `creator`, `filler`, and `locker` options allow deeper control over object creation.

<!-- doc-gen CODE src="./readme/code/creator-and-filler-options.ts" -->
```ts
import { type DefaultProtoItem, recordTypeKey, staticRecords } from 'static-records'

type Widget = {
  readonly id: string,
  readonly name: string
}

const WIDGETS = staticRecords<Widget>('Widget', {
  // creates initial object with id and recordType
  // default implementation shown
  creator: (id: string, recordType: string): DefaultProtoItem => {
    return {
      id,
      // the recordTypeKey symbol is used by the
      // getRecordType() function
      // and the frozenLocker() function to determine
      // which objects are static records
      [recordTypeKey]: recordType,
    }
  },
  // populates existing item with data before it is locked
  // default implementation shown
  filler: (
    // item is the object returned by the creator function
    item: DefaultProtoItem,
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
  // after filling all records each finalized record is passed here
  // this is where freezing objects can be done see: frozenFiller()
  // has no default behavior
  locker(item: Widget) {

  },
})
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
    lastName,
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

### Advanced Types
<!-- doc-gen CODE src="./readme/code/creator-and-filler-options-advanced.ts" -->
```ts
import { type DefaultProtoItem, recordTypeKey, staticRecords } from 'static-records'

/*
the above imported type that is the base of all proto objects
type DefaultProtoItem = {
  readonly id: string,
  readonly [recordTypeKey]: string,
}
*/

type Widget = {
  readonly id: string,
  readonly name: string
}

type ProtoWidget = DefaultProtoItem & {
  readonly something: string,
}

type WidgetInput = {
  speed: number
}
const WIDGETS = staticRecords<Widget, ProtoWidget, WidgetInput>('Widget', {
  // ts infers return type is ProtoWidget
  creator(id: string, recordType: string) {
    return {
      id,
      [recordTypeKey]: recordType,
      something: 'extra',
    }
  },
  // ts infers argument types
  // item: ProtoWidget,
  // input: WidgetInput,
  filler(item, input) {
    Object.assign(item, input)
  },
})

const BOOP = WIDGETS.define(
  'BOOP',
  // factory must return WidgetInput
  () => ({
    name: 'Boop',
    speed: 99,
  }),
)

WIDGETS.lock()
```
<!-- end-doc-gen -->

### Static Records Factories and Default Options

A static records factory can be created to set reusable default options.
<!-- doc-gen CODE src="./readme/code/static-records-factory.ts" test=true -->
```ts
import { type DefaultProtoItem, recordTypeKey, staticRecordsFactory } from 'static-records'

export type BaseItem = {
  readonly id: string,
  readonly uid: string,
}

type BaseProtoItem = BaseItem & DefaultProtoItem & {
  readonly uid: string,
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
})

export type Building = BaseItem & {
  readonly name: string,
}
export const BUILDINGS = makeStaticRecords<Building>('Building')

export const TOWER_A = BUILDINGS.define(
  'TOWER_A',
  () => ({
    name: 'Tower A',
  }),
)

BUILDINGS.lock()

TOWER_A.id // 'TOWER_A'
TOWER_A.name // 'Tower A'
TOWER_A.uid // 'Building-TOWER_A'
```
<!-- end-doc-gen -->

### Advanced Factory Types

<!-- doc-gen CODE src="./readme/code/static-records-factory-advanced.ts" test=true -->
```ts
import { type DefaultProtoItem, recordTypeKey, staticRecordsFactory } from 'static-records'

// base type for all items
export type BaseItem = {
  id: string,
  uid: string,
  zone: string,
}

// base type of all proto objects
export type BaseProtoItem = DefaultProtoItem & {
  uid: string,
}

// input that will be required by all record inputs
export type BaseInput = {
  zone: string,
}

export const makeStaticRecords = staticRecordsFactory<BaseItem, BaseProtoItem, BaseInput>({
  // returns BaseProtoItem
  creator(id, recordType) {
    return {
      id,
      [recordTypeKey]: recordType,
      // adding unique id from BaseProtoItem
      uid: `${recordType}-${id}`,
    }
  },
})

export type Building = BaseItem & {
  name: string,
}

// optionally add more to the proto object
export type BuildingProto = BaseProtoItem & {
  moreProtoData: string,
}

export type BuildingInput = BaseInput & {
  name: string,
}
export const BUILDINGS = makeStaticRecords<Building, BuildingProto, BuildingInput>('Building', {
  // options here override the factory options above via Object.assign(factoryOptions, recordOptions)
  filler(item, input) {
    // @TODO validate item.zone
    Object.assign(item, input)
  },
})

export const TOWER_A = BUILDINGS.define(
  'TOWER_A',
  () => ({
    name: 'Tower A',
    zone: 'Alpha',
  }),
)

BUILDINGS.lock()

TOWER_A.id // 'TOWER_A'
TOWER_A.name // 'Tower A'
TOWER_A.uid // 'Building-TOWER_A'
TOWER_A.zone // 'Alpha'
```
<!-- end-doc-gen -->

### Resolver Arguments
Resolver functions are passed the `protoItem` and  `recordType` arguments.
The `protoItem` arg has the `id` and `[recordTypeKey]` symbol properties.
The `recordType` is passed as the second arg for convenience.

<!-- doc-gen CODE src="./readme/code/resolver-args.ts" test=true -->
```ts
import { type DefaultProtoItem, staticRecords } from 'static-records'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly slug: string,
}

const PEOPLE = staticRecords<Person>('Person')

const DAN = PEOPLE.define(
  'DAN',
  // the protoItem arg has the id and recordType symbol keys
  // the record type is passed in the second for convenience
  (protoItem: DefaultProtoItem, recordType: string) => ({
    name: 'Dan',
    slug: protoItem.id + '-' + recordType,
  }),
)
PEOPLE.lock()

DAN.id // 'DAN'
DAN.name // 'Dan'
DAN.slug // 'DAN-Person'
```
<!-- end-doc-gen -->

### Lazy Resolvers
`makeLazyFiller()` creates a filler that can have properties resolve when they are first read.
This allows referencing the properties of other static records directly

<!-- doc-gen CODE src="./readme/code/lazy-props.ts" test=true -->
```ts
import { lazy, makeLazyFiller, staticRecords } from 'static-records'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly emergencyContactName: string,
}

const PEOPLE = staticRecords<Person>('Person', {
  filler: makeLazyFiller({}),
})

const DAN = PEOPLE.define(
  'DAN',
  () => ({
    name: 'Dan',
    emergencyContactName: lazy(() => SUE.name) as string,
  }),
)

const SUE = PEOPLE.define(
  'SUE',
  () => ({
    name: 'Sue',
    emergencyContactName: lazy(() => DAN.name) as string,
  }),
)
PEOPLE.lock()

DAN.emergencyContactName // 'Sue'
SUE.emergencyContactName // 'Dan'
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
