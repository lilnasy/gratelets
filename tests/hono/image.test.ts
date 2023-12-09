import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/image/")

test("it can optimize and serve images", async ({ expect, hono }) => {
    const request = new Request("http://example.com/_image?href=/_astro/some_penguin.97ef5f92.png&w=50&f=webp")
    const resImage = await hono.fetch(request)
    expect(resImage.status).to.equal(200)
}, { timeout: 10000 })
