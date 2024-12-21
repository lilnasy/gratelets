import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import { describe, beforeAll, test, expect, afterAll } from "vitest"
import { dev, type DevServer, build } from "./utils.ts"
import cloudflareAdapter from "astro-cloudflare-websocket"

describe("dev", {
    timeout: 1000,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let server: DevServer

    beforeAll(async () => server = await dev("./fixtures/websocket", {
        adapter: cloudflareAdapter()
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
    timeout: 500,
    skip: process.version.startsWith("v23.") === false
}, () => {
    let wrangler: ChildProcessWithoutNullStreams

    beforeAll(async () => {
        const fixture = await build("./fixtures/websocket", {
            adapter: cloudflareAdapter()
        })
        wrangler = spawn("pnpm", [ ..."dlx wrangler pages dev --compatibility-date 2024-12-21".split(" "), fixture.outDir ])
        
        const { promise, resolve, reject } = Promise.withResolvers<void>()
        wrangler.stdout.on("data", function onData(data) {
            const output = data.toString()
            if(
                output === "[wrangler:inf] Ready on http://127.0.0.1:8788\n" ||
                output === "[wrangler:inf] Ready on http://localhost:8788\n"
            ) {
                resolve()
            }
        })
        wrangler.stderr.on("data", data => {
            const output = data.toString()
            if (
                output.includes("Progress:") ||
                output.includes("Packages:") || 
                output.includes("deprecated subdependencies found") ||
                output.includes("postinstall")
            ) {
                return
            }
            reject(output)
        })
        wrangler.on("error", error => reject(error))
        await promise.catch(e => {
            wrangler.kill()
            throw e
        })
    }, 8000)

    afterAll(() => wrangler.kill())

    test("performs upgrade", async () => {
        const ws = new WebSocket(`ws://localhost:8788/ws`)
        const { promise, resolve, reject } = Promise.withResolvers<void>()
        ws.onopen = () => ws.send("Hello")
        ws.onmessage = (e) => {
            ws.close()
            expect(e.data).to.equal("olleH")
            resolve()
        }
        ws.onerror = reject
        await promise
    })

    test("endpoint can reject upgrade request", async () => {
        const ws = new WebSocket(`ws://localhost:8788/ws`, "unsupported-protocol")
        const { promise, resolve } = Promise.withResolvers<void>()
        ws.onerror = e => {
            expect("message" in e && e.message).to.equal("Received network error or non-101 status code.")
            resolve()
        }
        await promise
    })
})
