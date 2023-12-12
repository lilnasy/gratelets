import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/well-known-locations/")

test.skip("can load a valid well-known URI", async ({ expect, hono }) => {
    const res = await hono.fetch(new Request("http://example.com/.well-known/apple-app-site-association"))
    expect(res.status).to.equal(200)
    const json = await res.json()
    expect(json).to.deep.equal({ applinks: {} })
})

test.skip("cannot load a dot folder that is not a well-known URI", async ({ expect, hono }) => {
    const res = await hono.fetch(new Request("http://example.com/.hidden/file.json"))
    expect(res.status).to.equal(404)
})
