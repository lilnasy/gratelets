import { describe, beforeAll, afterAll, test, expect } from "vitest"
import * as cheerio from "cheerio"
import { build } from "../utils.ts"
import type { Exports, Server } from "../../packages/hono/runtime/server.ts"

describe('Assets', () => {
    let server: Server
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/image/", {
            vite: { build: { assetsInlineLimit: 0 } }
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        server = exports.startServer()
    })
    
    afterAll(() => { server.close() })
    
    test("assets within the _astro folder should be given immutable headers", async () => {
        const response = await fetch("http://localhost:4321/text-file")
        const cacheControl = response.headers.get("cache-control")
        expect(cacheControl).to.equal(null)
        const html = await response.text()
        const $ = cheerio.load(html)
        const fileURL = $("a").attr("href")
        {
            const response = await fetch(new URL(fileURL!, "http://localhost:4321"))
            const cacheControl = response.headers.get("cache-control")
            expect(cacheControl).to.equal("public, max-age=31536000, immutable")
        }
    })
})
