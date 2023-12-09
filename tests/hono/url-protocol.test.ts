import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/url-protocol/")

test("return http when non-secure", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("http://example.com/"))
    const html = await response.text()
    expect(html).to.include("http:")
})

test("return https when secure", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("https://example.com/"))
    const html = await response.text()
    expect(html).to.include("https:")
})

test("return http when the X-Forwarded-Proto header is set to http", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("http://example.com/", {
        headers: { "X-Forwarded-Proto": "https" }
    }))
    const html = await response.text()
    expect(html).to.include("https:")
})
