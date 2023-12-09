import { describe, beforeAll, test, expect } from "vitest"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("image endpoint", () => {
    let server: Hono

    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/image/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })

    test("it can optimize and serve images", async () => {
        const resImage = await server.fetch(new Request("http://example.com/_image?href=/_astro/some_penguin.97ef5f92.png&w=50&f=webp"))
        expect(resImage.status).to.equal(200)
    }, { timeout: 10000 })
})
