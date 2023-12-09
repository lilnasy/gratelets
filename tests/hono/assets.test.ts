import * as cheerio from "cheerio"
import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/image/", {
    vite: { build: { assetsInlineLimit: 0 } }
})

test("assets within the _astro folder should be given immutable headers", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("http://example.com/text-file"))
    const cacheControl = response.headers.get("cache-control")
    expect(cacheControl).to.equal(null)
    const html = await response.text()
    const $ = cheerio.load(html)
    const fileHref = $("a").attr("href")
    const fileUrl = new URL(fileHref!, "http://example.com")
    {
        const response = await hono.fetch(new Request(fileUrl))
        const cacheControl = response.headers.get("cache-control")
        expect(cacheControl).to.equal("public, max-age=31536000, immutable")
    }
})
