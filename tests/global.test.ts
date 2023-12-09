import { describe, beforeAll, test, expect } from "vitest"
import { build, type BuildFixture } from "./utils.ts"

describe("astro-global", () => {
    let fixture: BuildFixture
    beforeAll(async () => {
        fixture = await build("./fixtures/global")
    })

    test("An MDX component can use the Astro global directly", async () => {
        const renderedMdx = fixture.readTextFile("mdx-page/index.html")
        expect(renderedMdx).to.include(">You are currently at /mdx-page/</h3>")
    })

    test("A preact component can use the Astro global directly", async () => {
        const x = fixture.readTextFile("x/index.html")
        expect(x).to.include("<p>You are at /x/</p>")

        const y = fixture.readTextFile("y/index.html")
        expect(y).to.include("<p>You are at /y/</p>")

        const z = fixture.readTextFile("z/index.html")
        expect(z).to.include("<p>You are at /z/</p>")
    })
})
