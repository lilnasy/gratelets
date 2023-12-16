import url from "node:url"
import type { AstroInlineConfig } from "astro"
import type { createExports } from "@astrojs/node/server.js"
//@ts-expect-error
import globals from "./node_modules/playwright/lib/common/globals.js"
import { test as base } from "playwright/test"
import { build, type BuildFixture, dev, type DevServer } from "../tests/utils.ts"

interface TestExtension {
    build: BuildFixture
    exports: ReturnType<typeof createExports>
    adapter: ReturnType<TestExtension["exports"]["startServer"]>
    dev: DevServer
}

export function testFactory(relativeRootPath: `./fixtures/${string}`, options?: AstroInlineConfig) {
    let devServer: DevServer
    let buildFixture: BuildFixture
    let exports: TestExtension["exports"]
    let adapterServer: TestExtension["adapter"]
    const root = new URL(relativeRootPath, import.meta.url)
    const test = base.extend<TestExtension>({
        async page({ page }, use) {
            // doing this here avoids needing to create playwright.config.ts
            globals.currentTestInfo()._projectInternal.expect.timeout = 500
            await use(page)
        },
        async dev({}, use) {
            devServer ??= await dev(root, options)
            await use(devServer)
        },
        async build({}, use) {
            buildFixture ??= await build(root, options)
            await use(buildFixture)
        },
        async exports({ build }, use) {
            process.env.ASTRO_NODE_AUTOSTART = "disabled"
            exports ??= await import(url.pathToFileURL(build.resolve(`./server/entry.mjs`)).href + "?" + Date.now())
            await use(exports)
        },
        async adapter({ exports }, use) {
            adapterServer ??= exports.startServer()
            await use(adapterServer)
        }
    })
    return test
}
