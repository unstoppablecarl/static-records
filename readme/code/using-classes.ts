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

export const TESTS: TestCase[] = [
  {
    key: 'SUE.firstName',
    actual: SUE.firstName,
    expected: 'Susan',
  },
  {
    key: 'SUE.lastName',
    actual: SUE.lastName,
    expected: 'Smith',
  },
  {
    key: 'SUE.fullName',
    actual: SUE.fullName,
    expected: 'Susan Smith',
  },
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
  {
    key: 'SAM instanceof Seller',
    actual: SAM instanceof Seller,
    expected: true,
  },
]