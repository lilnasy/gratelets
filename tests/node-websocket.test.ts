// @ts-nocheck
import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, type DevServer, build, type BuildFixture } from "./utils.ts"
import nodeWsAdapter from "astro-node-websocket"

describe("dev", {
    timeout: 1000,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let server: DevServer

    beforeAll(async () => server = await dev("./fixtures/websocket", {
        adapter: nodeWsAdapter({ mode: "standalone" })
    }))

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

    test("handles binary data with arrayBuffer binaryType", { timeout: 1000 }, async () => {
        const ws = new WebSocket(`ws://localhost:${server.address.port}/arraybuffer`)
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send(new TextEncoder().encode("Hello"))        
        ws.onmessage = async e => {
            ws.close()
            expect(await e.data.text()).to.equal("olleH")
            resolve()
        }

        await promise
    })

    test("handles binary data with blob binaryType", { timeout: 1000 }, async () => {
        const ws = new WebSocket(`ws://localhost:${server.address.port}/blob`)
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send(new TextEncoder().encode("Hello"))
        ws.onmessage = async e => {
            ws.close()
            expect(await e.data.text()).to.equal("olleH")
            resolve()
        }

        await promise
    })
})

describe("build", {
    timeout: 500,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let fixture: BuildFixture
    let exports: ReturnType<typeof import("../packages/node-websocket/withastro/adapters/packages/integrations/node/src/server.js").createExports>
    let server: ReturnType<typeof exports.startServer>

    beforeAll(async () => {
        process.env.NODE_ENV = "production"
        process.env.ASTRO_NODE_AUTOSTART = "disabled"
        fixture = await build("./fixtures/websocket", {
            adapter: nodeWsAdapter({ mode: "standalone" })
        })
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

    test("handles binary data with arrayBuffer binaryType", { timeout: 1000 }, async () => {
        const ws = new WebSocket(`ws://localhost:${server.server.port}/arraybuffer`)
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send(new TextEncoder().encode("Hello"))        
        ws.onmessage = async e => {
            ws.close()
            expect(await e.data.text()).to.equal("olleH")
            resolve()
        }

        await promise
    })

    test("handles binary data with blob binaryType", { timeout: 1000 }, async () => {
        const ws = new WebSocket(`ws://localhost:${server.server.port}/blob`)
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send(new TextEncoder().encode("Hello"))
        ws.onmessage = async e => {
            ws.close()
            expect(await e.data.text()).to.equal("olleH")
            resolve()
        }

        await promise
    })
})
