import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/locals/")

test("can use locals added by hono middleware", async ({ expect, hono }) => {
    const locals = { foo: "bar" }
    const response = await hono.fetch(new Request("http://example.com/from-hono-middleware"), { locals })
    const html = await response.text()
    expect(html).to.contain("<h1>bar</h1>")
})

test("throws an error when provided non-objects as locals", async ({ expect, hono }) => {
    const locals = "locals"
    const response = await hono.fetch(new Request("http://example.com/from-hono-middleware"), { locals })
    expect(response).to.deep.include({ status: 500 })
})

test("can use locals added by astro middleware", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("http://example.com/from-astro-middleware"))
    const html = await response.text()
    expect(html).to.contain("<h1>baz</h1>")
})

test("can access locals in an API route", async ({ expect, hono }) => {
    const locals = { foo: "bar" }
    const response = await hono.fetch(new Request("http://example.com/api", { method: "POST" }), { locals })
    const json = await response.json()
    expect(json.foo).to.equal("bar")
})
