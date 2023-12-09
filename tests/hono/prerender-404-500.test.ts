import { describe } from "vitest"
import { testFactory } from "./utils.ts"

const testPrerenderServer     = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.dev/" })
const testPrerenderServerBase = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.net/", base: "/some-base" })
const testPrerenderHybrid     = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.com/", output: "hybrid" })
const testPrerenderHybridBase = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.org/", output: "hybrid", base: "/some-base" })

describe("output server - with base", () => {
    testPrerenderServerBase("can render SSR route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/some-base/static"))
        const html = await response.text()
        const $ = cheerio.load(html)
        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    testPrerenderServerBase("can handle prerendered 404", async ({ cheerio, expect, hono }) => {
        const url = "http://example.com/some-base/missing"
        const res1 = await hono.fetch(new Request(url))
        const res2 = await hono.fetch(new Request(url))
        const res3 = await hono.fetch(new Request(url))
        
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
    
    testPrerenderServerBase("can handle prerendered 500 called indirectly", async ({ cheerio, expect, hono }) => {
        const url = "http://example.com/some-base/fivehundred"
        const response1 = await hono.fetch(new Request(url))
        const response2 = await hono.fetch(new Request(url))
        const response3 = await hono.fetch(new Request(url))
        
        expect(response1.status).to.equal(500)
        
        const html1 = await response1.text()
        const html2 = await response2.text()
        const html3 = await response3.text()
        
        expect(html1).to.contain("Something went wrong")
        
        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)
    })
    
    testPrerenderServerBase("prerendered 500 page includes expected styles", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/some-base/fivehundred"))
        const html = await response.text()
        const $ = cheerio.load(html)
        // length will be 0 if the stylesheet does not get included
        expect($("style")).to.have.a.lengthOf(1)
    })
})

describe("output server - without base", async () => {
    testPrerenderServer("can render SSR route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/static"))
        const html = await response.text()
        const $ = cheerio.load(html)
        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    testPrerenderServer("can handle prerendered 404", async ({ cheerio, expect, hono }) => {
        const url = "http://example.com/missing"
        const res1 = await hono.fetch(new Request(url))
        const res2 = await hono.fetch(new Request(url))
        const res3 = await hono.fetch(new Request(url))
        
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

describe("output hybrid - with base", () => {
    testPrerenderHybridBase("can render SSR route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/some-base/static"))
        const html = await response.text()
        const $ = cheerio.load(html)

        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    testPrerenderHybridBase("can handle prerendered 404", async ({ cheerio, expect, hono }) => {
        const url = "http://example.com/some-base/missing"
        const res1 = await hono.fetch(new Request(url))
        const res2 = await hono.fetch(new Request(url))
        const res3 = await hono.fetch(new Request(url))
        
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

describe("output hybrid - without base", async () => {
    testPrerenderHybrid("can render SSR route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/static"))
        const html = await response.text()
        const $ = cheerio.load(html)

        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })

    testPrerenderHybrid("can handle prerendered 404", async ({ cheerio, expect, hono }) => {
        const url = "http://example.com/missing"
        const res1 = await hono.fetch(new Request(url))
        const res2 = await hono.fetch(new Request(url))
        const res3 = await hono.fetch(new Request(url))

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
