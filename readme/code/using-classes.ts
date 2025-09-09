import { type HasId, type HasRecordKey, recordTypeKey, staticRecords } from '../../src'
import type { TestCase } from '../types'

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

// if no input type argument is provided
// then WidgetInput defaults to Omit<Item, 'id' | typeof recordTypeKey>
type SellerInput = {
  firstName?: string,
  lastName?: string,
}

const SELLERS = staticRecords<Seller, SellerInput>(Seller.name, {
  creator: (id: string, recordType: string) => {
    // create the initial object instance
    return new Seller(id, recordType)
  },
  filler: (
    // object returned by creator function
    item,
    // input is the object returned by the factory function passed to WIDGETS.define('MY_ID', () => input)
    // the type is determined by the second type argument passed to staticRecords()
    input,
  ) => {
    // the following would throw an error as firstName is readonly
    // item.firstName = input.firstName ?? item.firstName

    // inside this function the object is still being created
    // so readonly should not be checked yet

    // typescript doesn't check readonly when using Object.assign()
    // but you can ensure the type safety of the source object manually
    const source: Pick<Seller, 'firstName' | 'lastName'> = {
      firstName: input.firstName ?? item.firstName,
      lastName: input.lastName ?? item.lastName,
    }

    Object.assign(item, source)
  },
})

const SAM = SELLERS.define(
  'SAM',
  () => ({
    firstName: 'Samuel',
  }),
)

SELLERS.lock()
export const TESTS: TestCase[] = [
  {
    key: 'SAM.firstName',
    actual: SAM.firstName,
    expected: 'Samuel',
  },
  {
    key: 'SAM.lastName',
    actual: SAM.lastName,
    expected: 'unknown',
  },
  {
    key: 'SAM.fullName',
    actual: SAM.fullName,
    expected: 'Samuel unknown',
  },
]