import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, type DevServer } from "./utils.ts"

const stylesheetRegex = /(?<=<style data-vite-dev-id="[^"]*">)[\s\S]*(?=<\/style>)/

let server: DevServer

beforeAll(async () => { server = await dev("./fixtures/stylex") })
afterAll(async () => { await server.stop() })

describe("with react", () => {
    test("hoists styles", async () => {
        const html = await server.fetch("/")
        expect(html).toMatch(stylesheetRegex)
        expect(html).toMatch(/div id="counter" class="(?<classes>[^"]*)"/)
        const [ sheet ] = stylesheetRegex.exec(html)!
        const counterElement = /div id="counter" class="(?<classes>[^"]*)"/.exec(html)!.groups!
        for (const className of counterElement.classes.split(" ")) {
            expect(sheet).toContain("." + className)
        }
        expect(sheet).toContain("place-items")
        expect(sheet).toContain("grid-template-columns")
        expect(sheet).toContain("margin-top")
    })
})
