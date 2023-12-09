import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/errors/")

test("errors within the stream", async ({ cheerio, expect, hono }) => {
    const res = await hono.fetch(new Request("http://example.com/in-stream"))
    const html = await res.text()
    const $ = cheerio.load(html)
    expect($("p").text().trim()).to.equal("Internal server error")
})
