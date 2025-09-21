import { lazyTree, makeLazyFiller, staticRecords, type To } from '../../src'
import type { TestCase } from '../types'

type Person = {
  readonly id: string,
  readonly name: string,
  readonly extra: {
    readonly id: string,
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

const customParentKey = '__parent'

const PEOPLE = staticRecords<Person>('Person', {
  filler: makeLazyFiller({
    lazyTree: true,
    parentKey: customParentKey,
  }),
})

const DAN = PEOPLE.define(
  'DAN',
  () => ({
    name: 'Dan',
    extra: {
      id: 'abc',
      deep: {
        property: lazyTree<
          // return type
          Person['extra']['deep']['property'],
          // parent
          Person['extra']['deep'],
          // root,
          Person,
          // override default parent key from 'parent' to '__parent'
          typeof customParentKey
        >((parent, root) => {
          return {
            idFromParent: 'idFromParent: ' + parent?.__parent?.id,
            idFromRoot: 'idFromRoot: ' + root.extra.id,
            child: {
              even: lazyTree<
                To<Person, 'extra.deep.property.child.even', typeof customParentKey>
              >((parent) => {
                return {
                  deeper: {
                    idFromAncestor: 'idFromAncestor: ' + parent?.__parent?.idFromParent,
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