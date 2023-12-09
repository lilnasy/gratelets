import { describe, beforeAll, test, expect } from "vitest"
import { Hono } from "hono"
import { build } from "../utils.ts"
import type { Exports } from "../../packages/hono/runtime/server.ts"

describe("Adapter Headers", () => {
    let server: Hono
    
    beforeAll(async () => {
        const fixture = await build("./fixtures/hono/headers/")
        process.env.ASTRO_HONO_AUTOSTART = "disabled"
        const exports = await import(fixture.resolve("server/entry.mjs")) as Exports
        const hono = new Hono
        hono.use("*", exports.handler)
        server = hono
    })
    
    test("Endpoint Simple Headers", async () => {
        await runTest("/endpoints/simple", {
            "content-type": "text/plain;charset=utf-8",
            "x-hello": "world"
        })
    })
    
    test("Endpoint Astro Single Cookie Header", async () => {
        await runTest("/endpoints/astro-cookies-single", {
            "content-type": "text/plain;charset=utf-8",
            "set-cookie": "from1=astro1"
        })
    })
    
    test("Endpoint Astro Multi Cookie Header", async () => {
        await runTest("/endpoints/astro-cookies-multi", {
            "content-type": "text/plain;charset=utf-8",
            "set-cookie": "from1=astro1, from2=astro2"
        })
    })
   
    test("Endpoint Response Single Cookie Header", async () => {
        await runTest("/endpoints/response-cookies-single", {
            "content-type": "text/plain;charset=utf-8",
            "set-cookie": "hello1=world1"
        })
    })
    
    test("Endpoint Response Multi Cookie Header", async () => {
        await runTest("/endpoints/response-cookies-multi", {
            "content-type": "text/plain;charset=utf-8",
            "set-cookie": "hello1=world1, hello2=world2"
        })
    })
    
    test("Endpoint Complex Headers Kitchen Sink", async () => {
        await runTest("/endpoints/kitchen-sink", {
            "content-type": "text/plain;charset=utf-8",
            "x-single": "single",
            "x-triple": "one, two, three",
            "set-cookie": "hello1=world1, hello2=world2"
        })
    })
    
    test("Endpoint Astro and Response Single Cookie Header", async () => {
        await runTest("/endpoints/astro-response-cookie-single", {
            "content-type": "text/plain;charset=utf-8",
            "set-cookie": "from1=response1, from1=astro1"
        })
    })
    
    test("Endpoint Astro and Response Multi Cookie Header", async () => {
        await runTest("/endpoints/astro-response-cookie-multi", {
            "content-type": "text/plain;charset=utf-8",
            "set-cookie": "from1=response1, from2=response2, from3=astro1, from4=astro2"
        })
    })
    
    test("Endpoint Response Empty Headers Object", async () => {
        await runTest("/endpoints/response-empty-headers-object", {
            "content-type": "text/plain;charset=UTF-8"
        })
    })
    
    test("Endpoint Response undefined Headers Object", async () => {
        await runTest("/endpoints/response-undefined-headers-object", {
            "content-type": "text/plain;charset=UTF-8"
        })
    })
    
    test("Component Astro Single Cookie Header", async () => {
        await runTest("/astro/component-astro-cookies-single", {
            "content-type": "text/html",
            "set-cookie": "from1=astro1"
        })
    })
    
    test("Component Astro Multi Cookie Header", async () => {
        await runTest("/astro/component-astro-cookies-multi", {
            "content-type": "text/html",
            "set-cookie": "from1=astro1, from2=astro2"
        })
    })
    
    test("Component Response Single Cookie Header", async () => {
        await runTest("/astro/component-response-cookies-single", {
            "content-type": "text/html",
            "set-cookie": "from1=value1"
        })
    })
    
    test("Component Response Multi Cookie Header", async () => {
        await runTest("/astro/component-response-cookies-multi", {
            "content-type": "text/html",
            "set-cookie": "from1=value1, from2=value2"
        })
    })
    
    test("Component Astro and Response Single Cookie Header", async () => {
        await runTest("/astro/component-astro-response-cookie-single", {
            "content-type": "text/html",
            "set-cookie": "from1=response1, from1=astro1"
        })
    })
    
    test("Component Astro and Response Multi Cookie Header", async () => {
        await runTest("/astro/component-astro-response-cookie-multi", {
            "content-type": "text/html",
            "set-cookie": "from1=response1, from2=response2, from3=astro1, from4=astro2"
        })
    })

    async function runTest(url: string, expectedHeaders: Record<string, string | string[]>) {
        const response = await server.fetch(new Request(`http://example.com${url}`))
        for (const [key, value] of Object.entries(expectedHeaders)) {
            expect(response.headers.get(key)).to.equal(value)
        }
    }
})
