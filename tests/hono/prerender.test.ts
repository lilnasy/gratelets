import { describe } from "vitest"
import { testFactory } from "./utils.ts"

const testPrerenderServer     = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "true" } })
const testPrerenderServerBase = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "true" }, base: "/some-base" })
const testPrerenderHybrid     = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "false" }, output: "hybrid" })
const testPrerenderHybridBase = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "false" }, output: "hybrid", base: "/some-base" })

describe("prerendering - with base", async () => {
    testPrerenderServerBase("can render SSR route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderServerBase("can render prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderServerBase("can render prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderServerBase("can render prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderServerBase("omitting the trailing slash results in a redirect that includes the base", async ({ expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two"))
        expect(res.status).to.equal(301)
        expect(res.headers.get("location")).to.equal("/some-base/two/")
    })
})

describe("prerendering - without base", async () => {
    testPrerenderServer("can render SSR route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderServer("can render prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderServer("can render prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderServer("can render prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
       
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
})

describe("hybrid rendering - with base", () => {
    testPrerenderHybridBase("Can render SSR route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderHybridBase("Can render prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderHybridBase("Can render prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderHybridBase("Can render prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderHybridBase("Omitting the trailing slash results in a redirect that includes the base", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        expect(res.status).to.equal(301)
        expect(res.headers.get("location")).to.equal("/some-base/one/")
    })
})

describe("hybrid rendering - without base", async () => {
    testPrerenderHybrid("can render SSR route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testPrerenderHybrid("can render prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderHybrid("can render prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testPrerenderHybrid("Can render prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
})
