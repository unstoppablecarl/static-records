import { lazyTree, makeLazyFiller, staticRecords, type To } from '../../src'
import type { TestCase } from '../types'

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
      slug: lazyTree((parent, root) => {
        return {
          slugId: 'slugId: ' + parent?.id,
          rootName: 'rootName: ' + root.name,
        }
      }),
      deep: {
        property: lazyTree<
          // return type
          Person['extra']['deep']['property'],
          // parent
          Person['extra']['deep'],
          // root,
          Person
        >((parent1, root) => {
          return {
            idFromParent: 'idFromParent: ' + parent1.parent?.id,
            idFromRoot: 'idFromRoot: ' + (root as Person).extra.id,
            child: {
              even: lazyTree<
                // use the To<> helper to provide the return type, parent, and root automatically
                // To<> will autocomplete the dot path properties based on the first arg (Person)
                To<Person, 'extra.deep.property.child.even'>
              >((parent) => {
                return {
                  deeper: {
                    idFromAncestor: 'idFromAncestor: ' + parent?.parent?.idFromParent,
                  },
                }
              }),
            },
          }
        }),
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