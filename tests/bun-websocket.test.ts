import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, type DevServer, build, type BuildFixture } from "./utils.ts"
import nodeBunAdapter from "../packages/bun-websocket/NuroDev/astro-bun/package/src/index.ts"

describe("dev", {
    timeout: 1000,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let server: DevServer

    beforeAll(async () => server = await dev("./fixtures/websocket", {
        adapter: nodeBunAdapter()
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
})

describe("build", {
    timeout: 2000,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let fixture: BuildFixture
    let bun: ChildProcessWithoutNullStreams

    beforeAll(async () => {
        fixture = await build("./fixtures/websocket", {
            adapter: nodeBunAdapter()
        })
        bun = spawn("bun", [ fixture.serverEntry ])
        const { promise, resolve } = Promise.withResolvers<void>()
        bun.stdout.on("data", function onData (data) {
            if (data.toString().includes("Server listening")) {
                resolve()
            }
        })
        await promise
    })

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
        ws.onerror = e => {
            console.log(e)
        }
        ws.onclose = () => {
            console.log("closed")
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
})
