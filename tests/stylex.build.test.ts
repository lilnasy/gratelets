import { describe, beforeAll, test, expect } from "vitest"
import { build, type BuildFixture } from "./utils.ts"

const stylesheetRegex = /(?<=<style>)[\s\S]*(?=<\/style>)/

let fixture: BuildFixture
beforeAll(async () => { fixture = await build("./fixtures/stylex") })

describe("with react", () => {
    test("hoists styles", async () => {
        const html = fixture.readTextFile("/index.html")
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
