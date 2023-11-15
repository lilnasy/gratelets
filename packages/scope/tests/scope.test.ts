import { describe, beforeAll, test, expect } from 'vitest'
import { build, readTextFile } from './utils.ts'

describe('astro-scope', () => {
    beforeAll(async () => {
        await build('./fixtures/minimal')
    })

    test('TODO', async () => {
        const renderedScope = readTextFile('./fixtures/minimal/dist/index.html')
        expect(renderedScope).to.toMatchInlineSnapshot('"<!DOCTYPE html>j7pv25f6"')
    })
})
