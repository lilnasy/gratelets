import type { Page } from "playwright/test"
import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/typed-api")

test.describe("dev", () => {
    test("an action can be called", ({ dev, page }) => basics(page))
    test("the action ran on the server", ({ dev, page }) => envVars(page))
    test("the input can be validated with zod", ({ dev, page }) => zodValidation(page))
    test("stopping dev server", ({ dev }) => dev.stop())
})

test.describe("build", () => {
    test("an action can be called", ({ adapter, page }) => basics(page))
    test("the action ran on the server", ({ adapter, page }) => envVars(page))
    test("the input can be validated with zod", ({ adapter, page }) => zodValidation(page))
    test("stopping adapter server", ({ adapter }) => adapter.server.stop())
})

async function basics(page: Page) {
    await page.goto("http://localhost:4321/01-basics")
    await page.fill("input", "hello")
    await page.click("button")
    await test.expect(page.locator("output")).toHaveText("olleh")
}

async function envVars(page: Page) {
    await page.goto("http://localhost:4321/02-server-env-vars")
    process.env.REVERSE_PREFIX = "server"
    await page.fill("input", "hello")
    await page.click("button")
    await test.expect(page.locator("output")).toHaveText("server-olleh")
    process.env.REVERSE_PREFIX = "action"
    await page.click("button")
    await test.expect(page.locator("output")).toHaveText("action-olleh")
}

async function zodValidation(page: Page) {
    await page.goto("http://localhost:4321/03-zod-validation")
    await page.fill("input", `{ "x": 5 }`)
    await page.click("button")
    await test.expect(page.locator("output")).toHaveText("10")

    await page.fill("input", `{ "x": "hello" }`)
    await page.click("button")
    await test.expect(page.locator("output")).toHaveText("The API call was unsuccessful: Internal Server Error.\nSee `error.cause` for the full response.")
}
