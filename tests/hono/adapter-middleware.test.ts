import { describe, beforeAll, afterAll, test, expect } from "vitest"
import * as cheerio from "cheerio"
import { build } from "../utils.ts"
import adapter from "../../packages/hono/integration.ts"
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import type { Exports, Server } from "../../packages/hono/runtime/server.ts"

describe("standalone mode", () => {
    let server: Server
    
    beforeAll(async () => {
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const fixture = await build("./fixtures/hono/adapter-middleware/")
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        server = exports.startServer()
    })
    
    afterAll(() => { server.close() })
    
    test("404 behavior", async () => {
        const res = await fetch("http://localhost:4321/error-page")
        expect(res.status).to.equal(404)
        const html = await res.text()
        const $ = cheerio.load(html)
        const body = $("body")
        expect(body.text()).to.equal("Page does not exist")
    })
})

describe("middleware mode", () => {
    let server: Server
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/adapter-middleware/", {
            adapter: adapter({ mode: "middleware" })
        })
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const handler = exports.handler
        const app = new Hono
        app.use("*", handler)
        server = serve({ fetch: app.fetch, port: 8888 })
    })
    
    afterAll(() => { server.close() })
    
    test("404 behavior", async () => {
        const res = await fetch("http://localhost:8888/ssr")
        expect(res.status).to.equal(200)
        const html = await res.text()
        const $ = cheerio.load(html)
        const body = $("body")
        expect(body.text()).to.contain("Here's a random number")
    })
})
