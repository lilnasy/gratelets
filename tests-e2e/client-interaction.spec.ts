import type { Page } from "playwright/test"
import { testFactory } from "./utils.ts"
import { expect } from "playwright/test"

const test = testFactory("./fixtures/client-interaction")

test("dev mode - components hydrates after click", ({ dev, page }) => basics(page))
test("stopping dev server", ({ dev }) => dev.stop())
test("production build - components hydrates after click", ({ preview, page }) => basics(page))
test("stopping preview server", ({ preview }) => preview.stop())

async function basics(page: Page) {
    await page.goto("http://localhost:4321/")
    await expect(page.locator("#counter-message")).toHaveText("server rendered")
    await page.click("body")
    await expect(page.locator("#counter-message")).toHaveText("hydrated")
}
