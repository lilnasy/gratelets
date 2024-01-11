import { describe, expect, test } from "vitest"
import { build } from "./utils.ts"

describe("astro-server-only-modules", () => {
    test("Build succeeds without the integration.", async () => {
        process.env.INCLUDE = "false"
        await build("./fixtures/server-only-modules")
    })
    test("Build fails with the integration.", async () => {
        process.env.INCLUDE = "true"
        try {
            await build("./fixtures/server-only-modules")
            expect.unreachable()
        } catch {}
    })
})
