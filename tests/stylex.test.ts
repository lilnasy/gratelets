import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, build, type DevServer, type BuildFixture } from "./utils.ts"
import * as cheerio from "cheerio"

describe("dev", () => {
    let server: DevServer
    
    beforeAll(async () => { server = await dev("./fixtures/stylex") })
    afterAll(async () => { await server.stop() })
    
    for (const framework of ["preact", "react", "svelte", "solid"]) {
        test("with " + framework, async () => {
            commonExpectations(await server.fetch("/" + framework))
        })
    }
})

describe("build", () => {
    let fixture: BuildFixture
    
    beforeAll(async () => { fixture = await build("./fixtures/stylex") })
    
    for (const framework of ["preact", "react", "svelte", "solid"]) {
        test("with " + framework, async () => {
            commonExpectations(fixture.readTextFile("/" + framework + "/index.html"))
        })
    }
})

function commonExpectations(html: string) {
    const $ = cheerio.load(html)
    let stylesheet = ""
    $("style").each((_, elem) => { stylesheet += $(elem).text() })
    const counterElement = $("#counter")
    for (const className of counterElement.attr("class")!.split(" ")) {
        expect(stylesheet).toContain("." + className)
    }
    expect(stylesheet).toContain("place-items")
    expect(stylesheet).toContain("grid-template-columns")
    expect(stylesheet).toContain("margin-top")
}
