import { describe, beforeAll, test, expect } from 'vitest'
import { build, readTextFile } from './utils.ts'

describe('astro-global', () => {
    beforeAll(async () => {
        await build('./fixtures/mdx-preact')
    })

    test('A preact component can use the Astro global directly', async () => {
        const x = readTextFile('./fixtures/mdx-preact/dist/x/index.html')
        expect(x).to.include('<p>You are at /x/</p>')

        const y = readTextFile('./fixtures/mdx-preact/dist/y/index.html')
        expect(y).to.include('<p>You are at /y/</p>')

        const z = readTextFile('./fixtures/mdx-preact/dist/z/index.html')
        expect(z).to.include('<p>You are at /z/</p>')
    })
})
