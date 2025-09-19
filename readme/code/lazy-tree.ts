import { lazyTree, makeLazyFiller, staticRecords } from '../../src'
import type { TestCase } from '../types'
import type { HasParent } from 'static-records'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly extra: {
    readonly id: string,
    readonly slug: {
      slugId: string,
      rootName: string,
    }
    readonly deep: {
      readonly property: {
        readonly idFromParent: string,
        readonly idFromRoot: string,
        readonly child: {
          readonly even: {
            readonly deeper: {
              readonly idFromAncestor: string
            }
          }
        }
      }
    }
  }
}

const PEOPLE = staticRecords<Person>('Person', {
  filler: makeLazyFiller({
    lazyTree: true,
  }),
})

const DAN = PEOPLE.define(
  'DAN',
  () => ({
    name: 'Dan',
    extra: {
      id: 'abc',
      slug: lazyTree((parent: Person['extra'], root: Person) => {
        return {
          slugId: 'slugId: ' + parent.id,
          rootName: 'rootName: ' + root.name,
        }
      }) as Person['extra']['slug'],
      deep: {
        property: lazyTree((parent: Person['extra']['deep'] & HasParent, root: Person) => {
          return {
            idFromParent: 'idFromParent: ' + parent?.parent?.id,
            idFromRoot: 'idFromRoot: ' + root.extra.id,
            child: {
              even: lazyTree((parent: Person['extra']['deep']['property']['child'] & HasParent) => {
                return {
                  deeper: {
                    idFromAncestor: 'idFromAncestor: ' + parent?.parent?.idFromParent,
                  },
                }
              }) as Person['extra']['deep']['property']['child']['even'],
            },
          }
        }) as Person['extra']['deep']['property'],
      },
    },
  }),
)
PEOPLE.lock()

export const TESTS: TestCase[] = [
  {
    key: 'DAN.meta.slug.slugId',
    actual: DAN.extra.slug.slugId,
    expected: 'slugId: abc',
  },
  {
    key: 'DAN.meta.slug.rootName',
    actual: DAN.extra.slug.rootName,
    expected: 'rootName: Dan',
  },
  {
    key: 'DAN.extra.deep.property.idFromParent',
    actual: DAN.extra.deep.property.idFromParent,
    expected: 'idFromParent: abc',
  },
  {
    key: 'DAN.extra.deep.property.idFromRoot',
    actual: DAN.extra.deep.property.idFromRoot,
    expected: 'idFromRoot: abc',
  },
  {
    key: 'DAN.extra.deep.property.child.even.deeper.idFromAncestor',
    actual: DAN.extra.deep.property.child.even.deeper.idFromAncestor,
    expected: 'idFromAncestor: idFromParent: abc',
  },
]