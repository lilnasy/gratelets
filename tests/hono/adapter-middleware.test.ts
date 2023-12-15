import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/adapter-middleware/")

test("standalone mode - 404 page", async ({ cheerio, expect, server }) => {
    const res = await fetch("http://localhost:4321/error-page")
    expect(res.status).to.equal(404)
    const html = await res.text()
    const $ = cheerio.load(html)
    const body = $("body")
    expect(body.text()).to.equal("Page does not exist")
    await server.destroy()
})

test("middleware mode - on-demand rendered page", async ({ cheerio, expect, hono }) => {
    const res = await hono.fetch(new Request("http://example.com/ssr"))
    expect(res.status).to.equal(200)
    const html = await res.text()
    const $ = cheerio.load(html)
    const body = $("body")
    expect(body.text()).to.contain("Here's a random number")
})
