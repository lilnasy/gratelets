import { describe, beforeAll, test, expect } from "vitest"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("test URIs beginning with a dot", () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/well-known-locations/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })

    test("can load a valid well-known URI", async () => {
        const res = await server.fetch(new Request("http://example.com/.well-known/apple-app-site-association"))
        expect(res.status).to.equal(200)
        const json = await res.json()
        expect(json).to.deep.equal({ applinks: {} })
    })

    test("cannot load a dot folder that is not a well-known URI", async () => {
        const res = await server.fetch(new Request("http://example.com/.hidden/file.json"))
        expect(res.status).to.equal(404)
    })
})
