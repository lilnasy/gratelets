import type { Page } from "playwright/test"
import { testFactory } from "./utils.ts"
import { expect } from "playwright/test"
import type { AstroInlineConfig as Config } from "astro"

const setups: Record<string, Config> = {
    // output: "server" is duplicated here, even though it is also present in astro.config.ts so that
    // the bug workaround for withastro/astro#12248 can be applied by build()
    "default config": { output: "server" },
    // "with trailingSlash set to never": { trailingSlash: "never" },
    // "with trailingSlash set to always": { trailingSlash: "always" },
    // "with a base path configured": { base: "/some-base" },
    "with tralingSlash and a base path configured": { output: "server", base: "/some-base", trailingSlash: "always" }
}

for (const [description, config] of Object.entries(setups)) {
    
    const test = testFactory("./fixtures/typed-api", config)

    test.describe(`${description} - dev`, () => {
        test("an action can be called", ({ dev, page }) => basics(page, resolve))
        test("the method can be POST", ({ dev, page }) => post(page, resolve))
        test("the ALL handler can be fetched", ({ dev, page }) => all(page, resolve))
        test("the action ran on the server", ({ dev, page }) => envVars(page, resolve))
        test("path params can be used", ({ dev, page }) => params(page, resolve))
        test("multiple params can be used", ({ dev, page }) => multiParams(page, resolve))
        test("spread params can be used", ({ dev, page }) => spreadParams(page, resolve))
        // zod validation is last because the error overlay from the server error pops up in the next test
        test("the input can be validated with zod", ({ dev, page }) => zodValidation(page, resolve))
        test("stopping dev server", ({ dev }) => dev.stop())
    })
    
    test.describe(`${description} - build`, () => {
        test("an action can be called", ({ adapter, page }) => basics(page, resolve))
        test("the method can be POST", ({ adapter, page }) => post(page, resolve))
        test("the ALL handler can be fetched", ({ adapter, page }) => all(page, resolve))
        test("the action ran on the server", ({ adapter, page }) => envVars(page, resolve))
        test("path params can be used", ({ adapter, page }) => params(page, resolve))
        test("multiple params can be used", ({ adapter, page }) => multiParams(page, resolve))
        test("spread params can be used", ({ adapter, page }) => spreadParams(page, resolve))
        test("the input can be validated with zod", ({ adapter, page }) => zodValidation(page, resolve))
        test("stopping adapter server", ({ adapter }) => adapter.server.stop())
    })

    function resolve(href: string) {
        const url = new URL(href)
        if (config.base !== undefined) {
            if (url.pathname.startsWith(config.base) === false) {
                url.pathname = config.base + url.pathname
            }
        }
        if (config.trailingSlash === "always") {
            if (url.pathname.endsWith("/") === false) {
                url.pathname = url.pathname + "/"
            }
        }
        if (config.trailingSlash === "never") {
            if (url.pathname.endsWith("/")) {
                url.pathname = url.pathname.slice(0, url.pathname.length - 1)
            }
        }
        return String(url)
    }
}

async function basics(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/basics"))
    await page.fill("input", "hello")
    await page.click("button")
    await expect(page.locator("output")).toHaveText("olleh")
}

async function post(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/post"))
    await page.fill("input", "hello")
    await page.click("button")
    await expect(page.locator("output")).toHaveText("from POST handler: olleh")
}

async function all(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/all"))
    await page.fill("input", "hello")
    await page.click("button")
    await expect(page.locator("output")).toHaveText("from ALL handler: SUBSCRIBEolleh")
}

async function envVars(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/server-env-vars"))
    process.env.REVERSE_PREFIX = "server"
    await page.fill("input", "hello")
    await page.click("button")
    await expect(page.locator("output")).toHaveText("server-olleh")
    process.env.REVERSE_PREFIX = "action"
    await page.click("button")
    await expect(page.locator("output")).toHaveText("action-olleh")
}

async function params(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/params"))
    await page.click("button")
    await expect(page.locator("output")).toHaveText("singleParam,xyz")
}

async function multiParams(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/multiple-params"))
    await page.click("button")
    await expect(page.locator("output")).toHaveText("multiple,abc params,xyz")
}

async function spreadParams(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/spread-params"))
    await page.click("button")
    await expect(page.locator("output")).toHaveText("spread,abc/def/ghi")
}

async function zodValidation(page: Page, resolve: (url: string) => string) {
    await page.goto(resolve("http://localhost:4321/zod-validation"))
    await page.fill("input", `{ "x": 5 }`)
    await page.click("button")
    await expect(page.locator("output")).toHaveText("10")
    await page.fill("input", `{ "x": "hello" }`)
    await page.click("button")
    await expect(page.locator("output")).toHaveText("The API call was unsuccessful: Internal Server Error.\nSee `error.cause` for the full response.")
}
