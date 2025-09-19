import { type Lazy, type MakeInput, makeLazyFiller, type OptionallyLazy, staticRecords } from '../../src'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly number: number,
  readonly deep: {
    readonly property: string
  }
}

// use this generate the same input type
// that staticRecords<Person>() would use by default
type DefaultPersonInput = MakeInput<Person>

// allow all properties to be lazy
type PersonInput = OptionallyLazy<DefaultPersonInput>

// this is what PersonInput looks like
type PersonInputEquivalent = {
  readonly id: Lazy<string>,
  readonly name: Lazy<string>,
  readonly number: Lazy<number>,
  readonly deep: Lazy<{
    readonly property: Lazy<string>
  }>
}

// provide the input type as 3rd arg
const PEOPLE = staticRecords<Person, never, PersonInput>('Person', {
  filler: makeLazyFiller(),
})