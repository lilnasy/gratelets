import { describe, beforeAll, test, expect } from 'vitest'
import { build, readTextFile } from './utils.ts'

describe('astro-global', () => {
    beforeAll(async () => {
        await build('./fixtures/mdx-preact')
    })

    test('An MDX component can use the Astro global directly', async () => {
        const renderedMdx = readTextFile('./fixtures/mdx-preact/dist/mdx-page/index.html')
        expect(renderedMdx).to.include('>You are currently at /mdx-page/</h3>')
    })
})
