import crypto from "node:crypto"
import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/api-route/")

test("can get the request body", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("https://example.com/recipes", {
        method: "POST",
        body: JSON.stringify({ id: 2 })
    }))
    const json = await response.json()
    expect(json.length).to.equal(1)
    expect(json[0].name).to.equal('Broccoli Soup')
})

test("can get binary data", async ({ expect, hono }) => {
    const response = await hono.fetch(new Request("https://example.com/binary", {
        method: "POST",
        body: new Uint8Array([1, 2, 3, 4, 5])
    }))
    const arrayBuffer = await response.arrayBuffer()
    const arr = Array.from(new Uint8Array(arrayBuffer))
    expect(arr).to.deep.equal([5, 4, 3, 2, 1])
})

test("can post large binary data", async ({ expect, hono }) => {
    const { readable, writable } = new TransformStream<ArrayBuffer, ArrayBuffer>
    const response_ = hono.fetch(new Request("https://example.com/hash", {
        method: "POST",
        body: readable,
        // @ts-expect-error duplex exists (and is required) in undici but maybe not in web types
        duplex: "half"
    }))
    
    const writer = writable.getWriter()
    // Send 256MB of garbage data in 256KB chunks. This should be fast (< 1sec).
    let remainingBytes = 256 * 1024 * 1024
    const chunkSize = 256 * 1024
    
    const hash = crypto.createHash("sha256")
    while (remainingBytes > 0) {
        const size = Math.min(remainingBytes, chunkSize)
        const chunk = Buffer.alloc(size, Math.floor(Math.random() * 256))
        hash.update(chunk)
        writer.write(chunk)
        remainingBytes -= size
    }
    
    writer.close()
    const expectedDigest = hash.digest()
    
    const response = await response_
    const arrayBuffer = await response.arrayBuffer()
    expect(new Uint8Array(arrayBuffer)).to.deep.equal(expectedDigest)
})

test("can bail on streaming", async ({ expect, hono }) => {
    const locals = { cancelledByTheServer: false }
    const request = new Request("https://example.com/streaming")
    const response = await hono.fetch(request, { locals })
    await response.body?.getReader().cancel()
    expect(locals).to.deep.include({ cancelledByTheServer: true })
})
