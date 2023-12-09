import { describe, beforeAll, afterAll, test, expect } from "vitest"
import { build } from "../utils.ts"
import type { Exports, Server } from "../../packages/hono/runtime/server.ts"

const weirdURLs = [
    "/\\xfs.bxss.me%3Fastrojs.com/hello-world",
    "/asdasdasd@ax_zX=.zxczas🐥%/úadasd000%/",
    "%",
    "%80",
    "%c",
    "%c0%80",
    "%20foobar%"
]

describe("bad URLs", () => {
    let server: Server

    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/bad-urls/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports 
        server = exports.startServer()
    })

    afterAll(() => { server.close() })
    
    for (const weirdUrl of weirdURLs) {
        test("does not crash on bad url: " + weirdUrl, async () => {
            const fetchResult = await fetch("http://localhost:4321/" + weirdUrl)
            expect([404, 500]).to.include(fetchResult.status)
            const stillWork = await fetch("http://localhost:4321/")
            const text = await stillWork.text()
            expect(text).to.equal("<!DOCTYPE html>Hello!")
        })
    }
})
