import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, type DevServer, build, type BuildFixture } from "./utils.ts"

describe("dev", { timeout: 1000 }, () => {
    let server: DevServer

    beforeAll(async () => server = await dev("./fixtures/node-websocket"))

    afterAll(() => server.stop())

    test("performs upgrade", { timeout: 1000 }, async () => {
        const ws = new WebSocket(`ws://localhost:${server.address.port}/ws`)
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send("Hello")
        ws.onmessage = (e) => {
            ws.close()
            expect(e.data).to.equal("olleH")
            resolve()
        }
        await promise
    })

    test("endpoint can reject upgrade request", async () => {
        const ws = new WebSocket(`ws://localhost:${server.address.port}/ws`, "unsupported-protocol")
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onerror = e => {
            expect("message" in e && e.message).to.equal("Received network error or non-101 status code.")
            resolve()
        }
        await promise
    })

    test("route can handle non-upgrade requests", async () => {
        const response = await fetch(`http://localhost:${server.address.port}/ws`)
        expect(response.status).to.equal(426)
        expect(response.headers.get("X-Error")).to.equal("Non Upgrade Request")
    })
})

describe("build", () => {
    let fixture: BuildFixture
    let exports: ReturnType<typeof import("../packages/node-ws/withastro/adapters/packages/node/src/server.js").createExports>
    let server: ReturnType<typeof exports.startServer>

    beforeAll(async () => {
        process.env.NODE_ENV = "production"
        process.env.ASTRO_NODE_AUTOSTART = "disabled"
        fixture = await build("./fixtures/node-ws")
        exports = await import(fixture.serverEntry)
        server = exports.startServer()
    })

    afterAll(() => server.server.stop())

    test("performs upgrade", async () => {
        const ws = new WebSocket(`ws://localhost:${server.server.port}/ws`)
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send("Hello")
        ws.onmessage = (e) => {
            ws.close()
            expect(e.data).to.equal("olleH")
            resolve()
        }
        await promise
    })

    test("endpoint can reject upgrade request", async () => {
        const ws = new WebSocket(`ws://localhost:${server.server.port}/ws`, "unsupported-protocol")
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onerror = e => {
            expect("message" in e && e.message).to.equal("Received network error or non-101 status code.")
            resolve()
        }
        await promise
    })
})
