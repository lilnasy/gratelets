import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/image/")

test("it can optimize and serve images", async ({ expect, server }) => {
    const resImage = await fetch("http://localhost:4321/_image?href=/_astro/some_penguin.9PDPbedL.png&w=50&f=webp")
    expect(resImage.status).to.equal(200)
    server.close()
})
