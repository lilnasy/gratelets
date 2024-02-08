import type { Page } from "playwright/test"
import { testFactory } from "./utils.ts"
import { expect } from "playwright/test"

const test = testFactory("./fixtures/client-interaction")

test("dev mode - directive makes the component hydrate after click", ({ dev, page }) => basics(page))
test("dev mode - idle value makes the component hydrate after click", ({ dev, page }) => idle(page))
test("stopping dev server", ({ dev }) => dev.stop())
test("production build - directive makes the component hydrate after click", ({ preview, page }) => basics(page))
test("production build - idle value makes the component hydrate after click", ({ preview, page }) => idle(page))
test("stopping preview server", ({ preview }) => preview.stop())

async function basics(page: Page) {
    await page.goto("http://localhost:4321/")
    await expect(page.locator("#counter-message")).toHaveText("server rendered")
    await page.click("body")
    await expect(page.locator("#counter-message")).toHaveText("hydrated")
}

// the nuances of how idle directive makes the component load cant be tested
// we check that it at least loads eventually
async function idle(page: Page) {
    await page.goto("http://localhost:4321/idle")
    await expect(page.locator("#counter-message")).toHaveText("server rendered")
    await page.click("body")
    await expect(page.locator("#counter-message")).toHaveText("hydrated")
}