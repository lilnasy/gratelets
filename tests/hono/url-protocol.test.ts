import { describe, beforeAll, test, expect } from "vitest"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("URL protocol", () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/url-protocol/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("return http when non-secure", async () => {
        const response = await server.fetch(new Request("http://example.com/"))
        const html = await response.text()
        expect(html).to.include("http:")
    })
    
    test("return https when secure", async () => {
        const response = await server.fetch(new Request("https://example.com/"))
        const html = await response.text()
        expect(html).to.include("https:")
    })
    
    test("return http when the X-Forwarded-Proto header is set to http", async () => {
        const response = await server.fetch(new Request("http://example.com/", {
            headers: { "X-Forwarded-Proto": "https" }
        }))
        const html = await response.text()
        expect(html).to.include("https:")
    })
})
