import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, type DevServer, build } from "./utils.ts"
import bunAdapter from "astro-bun-websocket"

describe("dev", {
    timeout: 1000,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let server: DevServer

    beforeAll(async () => server = await dev("./fixtures/websocket", {
        adapter: bunAdapter()
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
    timeout: 3000,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let bun: ChildProcessWithoutNullStreams

    beforeAll(async () => {
        const fixture = await build("./fixtures/websocket", {
            adapter: bunAdapter()
        })
        bun = spawn("bun", [ fixture.serverEntry ])
        const { promise, resolve, reject } = Promise.withResolvers<void>()
        bun.stdout.on("data", function onData(data) {
            if (data.toString().includes("Server listening")) {
                resolve()
            }
        })
        bun.stderr.on("data", function onData(data) {
            reject(data.toString())
        })
        bun.on("error", error => reject(error))
        await promise
    }, 2000)

    afterAll(() => bun.kill())

    test("performs upgrade", async () => {
        const ws = new WebSocket(`ws://localhost:4321/ws`)
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
        const ws = new WebSocket(`ws://localhost:4321/ws`, "unsupported-protocol")
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onerror = e => {
            expect("message" in e && e.message).to.equal("Received network error or non-101 status code.")
            resolve()
        }
        await promise
    })

    test("handles binary data with arrayBuffer binaryType", { timeout: 1000 }, async () => {
        const ws = new WebSocket("ws://localhost:4321/arraybuffer")
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
        const ws = new WebSocket("ws://localhost:4321/blob")
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
