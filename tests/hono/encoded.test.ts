import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/encoded/")

test("can get an Astro file", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("http://example.com/什么"))
    const html = await response.text()    
    expect(html).to.include("什么</h1>")    
})

test("can get a Markdown file", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("http://example.com/blog/什么"))
    const html = await response.text()    
    expect(html).to.include("什么</h1>")    
})
