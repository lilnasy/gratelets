import { describe, beforeAll, test, expect } from 'vitest'
import { build, readTextFile } from './utils.ts'

describe('astro-global', () => {
    beforeAll(async () => {
        await build('./fixtures/global')
    })

    test('An MDX component can use the Astro global directly', async () => {
        const renderedMdx = readTextFile('./fixtures/global/dist/mdx-page/index.html')
        expect(renderedMdx).to.include('>You are currently at /mdx-page/</h3>')
    })

    test('A preact component can use the Astro global directly', async () => {
        const x = readTextFile('./fixtures/global/dist/x/index.html')
        expect(x).to.include('<p>You are at /x/</p>')

        const y = readTextFile('./fixtures/global/dist/y/index.html')
        expect(y).to.include('<p>You are at /y/</p>')

        const z = readTextFile('./fixtures/global/dist/z/index.html')
        expect(z).to.include('<p>You are at /z/</p>')
    })
})
