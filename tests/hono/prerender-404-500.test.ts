import { describe } from "vitest"
import { testFactory } from "./utils.ts"

const testServer     = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.dev/" })
const testServerBase = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.net/", base: "/some-base" })
const testHybrid     = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.com/", output: "hybrid" })
const testHybridBase = testFactory("./fixtures/hono/prerender-404-500/", { site: "https://test.org/", output: "hybrid", base: "/some-base" })

describe("output:server - with base", () => {
    testServerBase("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/some-base/static"))
        const html = await response.text()
        const $ = cheerio.load(html)
        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    testServerBase("can serve prerendered 404", async ({ cheerio, expect, hono }) => {
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
    
    // this test can't be mocked because astro code makes a fetch request to the server running it
    testServerBase("can serve prerendered 500 called indirectly", async ({ server, expect }) => {
        const url = "http://localhost:4321/some-base/fivehundred"
        const response1 = await fetch(url)
        const response2 = await fetch(url)
        const response3 = await fetch(url)
        
        expect(response1.status).to.equal(500)
        
        const html1 = await response1.text()
        const html2 = await response2.text()
        const html3 = await response3.text()

        expect(html1).to.contain("Something went wrong")
        
        expect(html1).to.equal(html2)
        expect(html2).to.equal(html3)
    })
    
    // this test can't be mocked because astro code makes a fetch request to the server running it
    testServerBase("prerendered 500 page includes expected styles", async ({ server, cheerio, expect }) => {
        const response = await fetch("http://localhost:4321/some-base/fivehundred")
        const html = await response.text()
        const $ = cheerio.load(html)
        // length will be 0 if the stylesheet does not get included
        expect($("style")).to.have.a.lengthOf(1)
    })

    testServerBase("close server", async ({ server }) => { await server.destroy() })
})

describe("output:server - without base", () => {
    testServer("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/static"))
        const html = await response.text()
        const $ = cheerio.load(html)
        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    testServer("can serve prerendered 404", async ({ cheerio, expect, hono }) => {
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

describe("output:hybrid - with base", () => {
    testHybridBase("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/some-base/static"))
        const html = await response.text()
        const $ = cheerio.load(html)

        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })
    
    testHybridBase("can serve prerendered 404", async ({ cheerio, expect, hono }) => {
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

describe("output:hybrid - without base", () => {
    testHybrid("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const response = await hono.fetch(new Request("http://example.com/static"))
        const html = await response.text()
        const $ = cheerio.load(html)

        expect(response).to.deep.include({ status: 200 })
        expect($("h1").text()).to.equal("Hello world!")
    })

    testHybrid("can serve prerendered 404", async ({ cheerio, expect, hono }) => {
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
