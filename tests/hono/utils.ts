import { test as base } from "vitest"
import * as cheerio from "cheerio"
import { Hono } from "hono" 
import { build, type BuildFixture } from "../utils.ts"
import type { AstroInlineConfig } from "astro"
import type { Exports, Server } from "../../packages/hono/runtime/server.ts"

interface TestExtension {
    fixture: BuildFixture
    cheerio: typeof cheerio
    exports: Exports
    hono: Hono
    server: Server
}

export function testFactory(fixturePath: `./fixtures/hono/${string}`, options?: AstroInlineConfig & { env?: Record<string, string> }) {
    let fixture: BuildFixture
    let exports: Exports
    let server: Server
    const test = base.extend<TestExtension>({
        async cheerio({}, use) {
            await use(cheerio)
        },
        async fixture({}, use) {
            Object.assign(process.env, options?.env)
            fixture ??= await build(fixturePath, options)
            await use(fixture)
        },
        async exports({ fixture }, use) {
            process.env.ASTRO_HONO_AUTOSTART = "disabled"
            exports ??= await import(fixture.serverEntry) as Exports
            await use(exports)
        },
        async hono({ exports }, use) {
            const hono = new Hono
            hono.use("*", exports.handler)
            await use(hono)
        },
        async server({ exports }, use) {
            server ??= exports.startServer!()
            await use(server)
        },
    })
    return test
}
