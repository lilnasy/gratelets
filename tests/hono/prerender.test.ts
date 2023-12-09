import { describe, beforeAll, test, expect } from "vitest"
import * as cheerio from "cheerio"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("prerendering - with base", async () => {
    let server: Hono
    
    beforeAll(async () => {
        process.env.PRERENDER = "true"
        const fixture = await build("./fixtures/hono/prerender/", {
            base: "/some-base"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("can render SSR route", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("can render prerendered route", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("can render prerendered route with redirect and query params", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/two?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("can render prerendered route with query params", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/two/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("omitting the trailing slash results in a redirect that includes the base", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/two"))
        expect(res.status).to.equal(301)
        expect(res.headers.get("location")).to.equal("/some-base/two/")
    })
})

describe("prerendering - without base", async () => {
    let server: Hono
    
    beforeAll(async () => {
        process.env.PRERENDER = "true"
        const fixture = await build("./fixtures/hono/prerender/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("can render SSR route", async () => {
        const res = await server.fetch(new Request("http://example.com/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("can render prerendered route", async () => {
        const res = await server.fetch(new Request("http://example.com/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("can render prerendered route with redirect and query params", async () => {
        const res = await server.fetch(new Request("http://example.com/two?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("can render prerendered route with query params", async () => {
        const res = await server.fetch(new Request("http://example.com/two/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
       
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
})

describe("hybrid rendering - with base", () => {
    let server: Hono
    
    beforeAll(async () => {
        process.env.PRERENDER = "false"
        const fixture = await build("./fixtures/hono/prerender/", {
            base: "/some-base",
            output: "hybrid"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("Can render SSR route", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("Can render prerendered route", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("Can render prerendered route with redirect and query params", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/one?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("Can render prerendered route with query params", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/one/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("Omitting the trailing slash results in a redirect that includes the base", async () => {
        const res = await server.fetch(new Request("http://example.com/some-base/one"))
        expect(res.status).to.equal(301)
        expect(res.headers.get("location")).to.equal("/some-base/one/")
    })
})

describe("hybrid rendering - without base", async () => {
    let server: Hono
    
    beforeAll(async () => {
        process.env.PRERENDER = "false"
        const fixture = await build("./fixtures/hono/prerender/", {
            output: "hybrid"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("can render SSR route", async () => {
        const res = await server.fetch(new Request("http://example.com/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    test("can render prerendered route", async () => {
        const res = await server.fetch(new Request("http://example.com/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("can render prerendered route with redirect and query params", async () => {
        const res = await server.fetch(new Request("http://example.com/one?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    test("Can render prerendered route with query params", async () => {
        const res = await server.fetch(new Request("http://example.com/one/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
})
