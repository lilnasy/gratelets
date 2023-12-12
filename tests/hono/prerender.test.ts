import { describe } from "vitest"
import { testFactory } from "./utils.ts"

const testServer     = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "true" } })
const testServerBase = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "true" }, base: "/some-base" })
const testHybrid     = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "false" }, output: "hybrid" })
const testHybridBase = testFactory("./fixtures/hono/prerender/", { env: { PRERENDER: "false" }, output: "hybrid", base: "/some-base" })

describe("output:server - with base", () => {
    testServerBase("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testServerBase("can serve prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testServerBase("can serve prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testServerBase("can serve prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    // https://github.com/withastro/astro/issues/7026 does not affect this adapter negatively
    testServerBase.skip("omitting the trailing slash results in a redirect that includes the base", async ({ expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two"))
        expect(res.status).to.equal(301)
        expect(res.headers.get("location")).to.equal("/some-base/two/")
    })
})

describe("output:server - without base", () => {
    testServer("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testServer("can serve prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testServer("can serve prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testServer("can serve prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
       
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
})

describe("output:hybrid - with base", () => {
    testHybridBase("can serve on-demand rendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testHybridBase("can serve prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testHybridBase("can serve prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testHybridBase("can serve prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    // https://github.com/withastro/astro/issues/7026 does not affect this adapter negatively
    testHybridBase.skip("omitting the trailing slash results in a redirect that includes the base", async ({ expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/some-base/one"))
        expect(res.status).to.equal(301)
        expect(res.headers.get("location")).to.equal("/some-base/one/")
    })
})

describe("output:hybrid - without base", () => {
    testHybrid("can serve SSR route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/two"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("Two")
    })
    
    testHybrid("can serve prerendered route", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testHybrid("can serve prerendered route with redirect and query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
    
    testHybrid("can serve prerendered route with query params", async ({ cheerio, expect, hono }) => {
        const res = await hono.fetch(new Request("http://example.com/one/?foo=bar"))
        const html = await res.text()
        const $ = cheerio.load(html)
        
        expect(res.status).to.equal(200)
        expect($("h1").text()).to.equal("One")
    })
})
