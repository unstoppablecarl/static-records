import { markdownMagic } from 'markdown-magic'

// @ts-ignore
global.__DEV__ = true
// @ts-ignore
import codeTransform from '../node_modules/markdown-magic/src/transforms/code/index.js'
import { basename, dirname, resolve } from 'node:path'

const root = dirname(import.meta.dirname)

const config = {
  transforms: {
    CODE({ content, options }: { content: any, options: any }) {
      return codeTransform({ content, options })
        .then(async (content: string) => {
          if (options.test) {
            content = await replaceTests(options.src, content)
          }
          return content
        })
        .then((content: string) => {
          return content.replaceAll('../../src', 'static-records')
            .replaceAll(`import type { TestCase } from '../types'\n`, '')
        })
        .then((content: string) => {
          if (options.showFileName) {
            content = prependFileName(options.src, content)
          }
          return content
        })

    },
  },
  // debug: true,
}

markdownMagic(
  resolve(root, 'README.md'),
  config,
)

async function replaceTests(src: string, result: string) {
  const replace = await convertTests(src)
  const [content, removed] = result.split('export const TESTS: TestCase[] = [', 2)
  return content + replace + '```'
}

async function convertTests(src: string) {
  const { TESTS } = await import(resolve(root, src))

  let str = ''
  for (const test of TESTS) {
    const expected = test.expected_as_string ?? toSingleQuoteStringOrType(test.expected)
    str += `${test.key} // ${expected}\n`
  }
  return str
}

function toSingleQuoteStringOrType(val: any) {
  if (typeof val === 'string') {
    return `'${val}'`
  }

  return JSON.stringify(val).replace(/"/g, '\'')
}

function prependFileName(src: string, result: string) {
  const file = '`' + basename(src) + '`'
  return `${file}\n${result}`
}