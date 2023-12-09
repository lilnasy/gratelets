import { describe, beforeAll, test, expect } from "vitest"
import * as cheerio from "cheerio"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("errors", () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/errors/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })

    test("within the stream", async () => {
        const res = await server.fetch(new Request("http://example.com/in-stream"))
        const html = await res.text()
        const $ = cheerio.load(html)
        expect($("p").text().trim()).to.equal("Internal server error")
    })
})
