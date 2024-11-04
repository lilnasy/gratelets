import { describe, beforeAll, test, expect } from "vitest"
import { build, type BuildFixture } from "./utils.ts"

const stylesheetRegex = /(?<=<style>)[\s\S]*(?=<\/style>)/

let fixture: BuildFixture
beforeAll(async () => { fixture = await build("./fixtures/emotion") }, 10000)

const options = { skip: process.version.startsWith("v18") }

describe("basics", options, () => {
    test("hoists scoped styles", async () => {
        const html = fixture.readTextFile("/astro/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const testElement = /id="test" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + testElement.class)
        expect(sheet).toContain("." + testElement.class + ":hover")
    })

    test("global styles are injected", async () => {
        const html = fixture.readTextFile("/astro/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("@font-face{font-family:Hand;")
    })

    test("import aliasing works", () => {
        const html = fixture.readTextFile("/import-alias/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const testElement = /id="test" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + testElement.class)
        expect(sheet).toContain("." + testElement.class + ":hover")
        expect(sheet).toContain("@font-face{font-family:Hand;")
    })

    test("import namespacing works", () => {
        const html = fixture.readTextFile("/import-namespace/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const testElement = /id="test" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + testElement.class)
        expect(sheet).toContain("." + testElement.class + ":hover")
        expect(sheet).toContain("@font-face{font-family:Hand;")
    })
})

describe("react", options, () => {
    test("hoists scoped styles", () => {
        const html = fixture.readTextFile("/react/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", () => {
        const html = fixture.readTextFile("/react/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})

describe("solid", options, () => {
    test("hoists scoped styles", () => {
        const html = fixture.readTextFile("/solid/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", () => {
        const html = fixture.readTextFile("/solid/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})

describe("preact", options, () => {
    test("hoists scoped styles", () => {
        const html = fixture.readTextFile("/preact/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", () => {
        const html = fixture.readTextFile("/preact/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})

describe("svelte", options, () => {
    test("hoists scoped styles", () => {
        const html = fixture.readTextFile("/svelte/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        const divElement = /id="counter" class="(?<class>[^"]*)"/.exec(html)!.groups!
        expect(sheet).toContain("." + divElement.class)
    })

    test("global styles are injected", () => {
        const html = fixture.readTextFile("/svelte/index.html")
        const [ sheet ] = stylesheetRegex.exec(html)!
        expect(sheet).toContain("body{margin:0")
    })
})
