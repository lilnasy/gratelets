import { describe, beforeAll, test, expect } from "vitest"
import { dev, type DevServer } from "./utils.ts"

const stylesheetRegex = /(?<=<style data-vite-dev-id="[^"]*">)[\s\S]*(?=<\/style>)/

let server: DevServer
beforeAll(async () => { server = await dev("./fixtures/emotion") }, 10000)

describe("basics", () => {
    test("hoists scoped styles", async () => {
        const html = await server.fetch("/astro")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const testElement = /id="test" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + testElement.class)
        expect(sheet).toContain("." + testElement.class + ":hover")
    })

    test("global styles are injected", async () => {
        const html = await server.fetch("/astro")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("@font-face{font-family:Hand;")
    })

    test("import aliasing works", async () => {
        const html = await server.fetch("/import-alias")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const testElement = /id="test" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + testElement.class)
        expect(sheet).toContain("." + testElement.class + ":hover")
        expect(sheet).toContain("@font-face{font-family:Hand;")
    })

    test("import namespacing works", async () => {
        const html = await server.fetch("/import-namespace")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const testElement = /id="test" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + testElement.class)
        expect(sheet).toContain("." + testElement.class + ":hover")
        expect(sheet).toContain("@font-face{font-family:Hand;")
    })
})

describe("react", () => {
    test("hoists scoped styles", async () => {
        const html = await server.fetch("/react")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", async () => {
        const html = await server.fetch("/react")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})

describe("preact", () => {
    test("hoists scoped styles", async () => {
        const html = await server.fetch("/preact")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", async () => {
        const html = await server.fetch("/preact")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})

describe("solid", () => {
    test("hoists scoped styles", async () => {
        const html = await server.fetch("/solid")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", async () => {
        const html = await server.fetch("/solid")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})

describe("svelte", () => {
    test("hoists scoped styles", async () => {
        const html = await server.fetch("/svelte")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", async () => {
        const html = await server.fetch("/svelte")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})
