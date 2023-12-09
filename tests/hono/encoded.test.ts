import { describe, beforeAll, test, expect } from "vitest"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("encoded pathname", () => {
    let server: Hono

    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/encoded/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports    
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })

    test("can get an Astro file", async () => {
        const response = await server.fetch(new Request("http://example.com/什么"))
        const html = await response.text()    
        expect(html).to.include("什么</h1>")    
    })    

    test("can get a Markdown file", async () => {
        const response = await server.fetch(new Request("http://example.com/blog/什么"))
        const html = await response.text()    
        expect(html).to.include("什么</h1>")    
    })    
})    
