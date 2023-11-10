import { describe, beforeAll, test, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { build } from 'astro'

describe('astro-global', () => {
    beforeAll(async () => {
        const root = resolve("./fixtures/mdx-preact")
        await build({ root, logLevel: "error" })
    })

    test('A preact component can use the Astro global directly', async () => {
        const x = readTextFile("./fixtures/mdx-preact/dist/x/index.html")
        expect(x).toMatchInlineSnapshot('"<!DOCTYPE html><p>You are at /x/</p>"')

        const y = readTextFile("./fixtures/mdx-preact/dist/y/index.html")
        expect(y).toMatchInlineSnapshot('"<!DOCTYPE html><p>You are at /y/</p>"')

        const z = readTextFile("./fixtures/mdx-preact/dist/z/index.html")
        expect(z).toMatchInlineSnapshot('"<!DOCTYPE html><p>You are at /z/</p>"')
    })
})

function resolve(relativePath: string) {
    return fileURLToPath(new URL(relativePath, import.meta.url))
}

function readTextFile(path: string): string {
    const resolvedPath = resolve(path)
    const buffer = readFileSync(resolvedPath, "utf8")
    return buffer.toString()
}
