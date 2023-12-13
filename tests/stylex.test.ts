import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, build, type DevServer, type BuildFixture } from "./utils.ts"
import * as cheerio from "cheerio"

describe("dev", () => {
    let server: DevServer
    
    beforeAll(async () => { server = await dev("./fixtures/stylex") })
    afterAll(async () => { await server.stop() })
    
    for (const framework of ["react", "solid"]) {
        test("with " + framework, async () => {
            const html = await server.fetch("/" + framework)
            const $ = cheerio.load(html)
            const stylesheet = $("style").html()!
            const counterElement = $("#counter")
            for (const className of counterElement.attr("class")!.split(" ")) {
                expect(stylesheet).toContain("." + className)
            }
            expect(stylesheet).toContain("place-items")
            expect(stylesheet).toContain("grid-template-columns")
            expect(stylesheet).toContain("margin-top")
        })
    }
})

describe("build", () => {
    let fixture: BuildFixture
    
    beforeAll(async () => { fixture = await build("./fixtures/stylex") })
    
    for (const framework of ["react", "solid"]) {
        test("with " + framework, async () => {
            const html = fixture.readTextFile("/" + framework + "/index.html")
            const $ = cheerio.load(html)
            const stylesheet = $("style").html()!
            const counterElement = $("#counter")
            for (const className of counterElement.attr("class")!.split(" ")) {
                expect(stylesheet).toContain("." + className)
            }
            expect(stylesheet).toContain("place-items")
            expect(stylesheet).toContain("grid-template-columns")
            expect(stylesheet).toContain("margin-top")
        })
    }
})
