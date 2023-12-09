import { describe, beforeAll, test, expect } from "vitest"
import * as cheerio from "cheerio"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("prerender 404 - with base", () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/prerender-404-500/", {
            // inconsequential config that differs between tests
            // to bust cache and prevent modules and their state
            // from being reused
            site: "https://test.dev/",
            base: "/some-base"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("can render SSR route", async () => {
        const response = await server.fetch(new Request("http://example.com/some-base/static"))
        const html = await response.text()
        const $ = cheerio.load(html)
        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    test("can handle prerendered 404", async () => {
        const url = "http://example.com/some-base/missing"
        const res1 = await server.fetch(new Request(url))
        const res2 = await server.fetch(new Request(url))
        const res3 = await server.fetch(new Request(url))
        
        expect(res1.status).to.equal(404)
        expect(res2.status).to.equal(404)
        expect(res3.status).to.equal(404)
        
        const html1 = await res1.text()
        const html2 = await res2.text()
        const html3 = await res3.text()
        
        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)
        
        const $ = cheerio.load(html1)
        
        expect($("body").text()).to.equal("Page does not exist")
    })
    
    test.skip("can handle prerendered 500 called indirectly", async () => {
        const url = "http://example.com/some-base/fivehundred"
        const response1 = await server.fetch(new Request(url))
        const response2 = await server.fetch(new Request(url))
        const response3 = await server.fetch(new Request(url))
        
        expect(response1.status).to.equal(500)
        
        const html1 = await response1.text()
        const html2 = await response2.text()
        const html3 = await response3.text()
        
        expect(html1).to.contain("Something went wrong")
        
        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)
    })
    
    test.skip("prerendered 500 page includes expected styles", async () => {
        const response = await server.fetch(new Request("http://example.com/some-base/fivehundred"))
        const html = await response.text()
        const $ = cheerio.load(html)
        // length will be 0 if the stylesheet does not get included
        expect($("style")).to.have.a.lengthOf(1)
    })
})

describe.skip("prerender 404 - without base", async () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/prerender-404-500/", {
            // inconsequential config that differs between tests
            // to bust cache and prevent modules and their state
            // from being reused
            site: "https://test.info/"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("can render SSR route", async () => {
        const response = await server.fetch(new Request("http://example.com/static"))
        const html = await response.text()
        const $ = cheerio.load(html)
        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    test("can handle prerendered 404", async () => {
        const url = "http://example.com/missing"
        const res1 = await server.fetch(new Request(url))
        const res2 = await server.fetch(new Request(url))
        const res3 = await server.fetch(new Request(url))
        
        expect(res1.status).to.equal(404)
        expect(res2.status).to.equal(404)
        expect(res3.status).to.equal(404)
        
        const html1 = await res1.text()
        const html2 = await res2.text()
        const html3 = await res3.text()
        
        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)
        
        const $ = cheerio.load(html1)
        
        expect($("body").text()).to.equal("Page does not exist")
    })
})

describe.skip("hybrid 404 - with base", () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/prerender-404-500/", {
            // inconsequential config that differs between tests
            // to bust cache and prevent modules and their state
            // from being reused
            site: "https://test.com/",
            base: "/some-base",
            output: "hybrid"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("can render SSR route", async () => {
        const response = await server.fetch(new Request("http://example.com/some-base/static"))
        const html = await response.text()
        const $ = cheerio.load(html)

        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    test("can handle prerendered 404", async () => {
        const url = "http://example.com/some-base/missing"
        const res1 = await server.fetch(new Request(url))
        const res2 = await server.fetch(new Request(url))
        const res3 = await server.fetch(new Request(url))
        
        expect(res1.status).to.equal(404)
        expect(res2.status).to.equal(404)
        expect(res3.status).to.equal(404)
        
        const html1 = await res1.text()
        const html2 = await res2.text()
        const html3 = await res3.text()
        
        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)
        
        const $ = cheerio.load(html1)
        
        expect($("body").text()).to.equal("Page does not exist")
    })
})

describe.skip("hybrid 404 - without base", async () => {
    let server: Hono

    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/prerender-404-500/", {
            // inconsequential config that differs between tests
            // to bust cache and prevent modules and their state
            // from being reused
            site: "https://test.net/",
            output: "hybrid"
        })
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })

    test("can render SSR route", async () => {
        const response = await server.fetch(new Request("http://example.com/static"))
        const html = await response.text()
        const $ = cheerio.load(html)

        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })

    test("can handle prerendered 404", async () => {
        const url = "http://example.com/missing"
        const res1 = await server.fetch(new Request(url))
        const res2 = await server.fetch(new Request(url))
        const res3 = await server.fetch(new Request(url))

        expect(res1.status).to.equal(404)
        expect(res2.status).to.equal(404)
        expect(res3.status).to.equal(404)

        const html1 = await res1.text()
        const html2 = await res2.text()
        const html3 = await res3.text()

        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)

        const $ = cheerio.load(html1)

        expect($("body").text()).to.equal("Page does not exist")
    })
})
