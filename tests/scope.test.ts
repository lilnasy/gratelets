import { describe, beforeAll, test, expect } from "vitest"
import { build, type BuildFixture } from "./utils.ts"

const resultRegex = /<script type="module">const o="(?<script>.{8})";console.log\(o\);\n<\/script><h1 data-astro-cid-(?<attribute>.{8})>(?<textContent>.{8})<\/h1>/

describe("astro-scope", () => {
    let fixture: BuildFixture
    
    beforeAll(async () => {
        fixture = await build("./fixtures/scope")
    })

    test("Page A", async () => {
        const page = fixture.readTextFile("page-a/index.html")
        const { script, attribute, textContent } = page.match(resultRegex)!.groups!
        expect(script).to.equal(attribute)
        expect(attribute).to.equal(textContent)
    })

    test("Page B", async () => {
        const page = fixture.readTextFile("page-b/index.html")
        const { script, attribute, textContent } = page.match(resultRegex)!.groups!
        expect(script).to.equal(attribute)
        expect(attribute).to.equal(textContent)
    })
})
