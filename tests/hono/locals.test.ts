import { describe, beforeAll, test, expect } from "vitest"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("API routes", () => {
    let server: Hono

    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/locals/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })

    test("can use locals added by hono middleware", async () => {
        const locals = { foo: "bar" }
        const response = await server.fetch(new Request("http://example.com/from-hono-middleware"), { locals })
        const html = await response.text()
        expect(html).to.contain("<h1>bar</h1>")
    })

    test("throws an error when provided non-objects as locals", async () => {
        const locals = "locals"
        const response = await server.fetch(new Request("http://example.com/from-hono-middleware"), { locals })
        expect(response).to.deep.include({ status: 500 })
    })

    test("can use locals added by astro middleware", async () => {
        const response = await server.fetch(new Request("http://example.com/from-astro-middleware"))
        const html = await response.text()
        expect(html).to.contain("<h1>baz</h1>")
    })

    test("can access locals in an API route", async () => {
        const locals = { foo: "bar" }
        const response = await server.fetch(new Request("http://example.com/api", { method: "POST" }), { locals })
        const json = await response.json()
        expect(json.foo).to.equal("bar")
    })
})
