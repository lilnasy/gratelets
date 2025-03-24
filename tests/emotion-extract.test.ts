import { describe, test, beforeAll, afterAll, expect } from "vitest"
import { spawn } from "node:child_process"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "emotion-extract")

describe("dev", () => {
    let devProcess: ReturnType<typeof spawn>

    beforeAll(async () => {
        devProcess = spawn("node", [join(fixtureDir, "node_modules", "@react-router", "dev", "bin.js"), "dev"], {
            cwd: fixtureDir,
        })

        devProcess.stdout!.on("data", (data) => {
            console.log({ data: data.toString() })
        })

        devProcess.stderr!.on("data", (data) => {
            console.log({ data: data.toString() })
        })

        await new Promise<void>((resolve, reject) => {
            devProcess.stdout!.on("data", (data) => {
                if (data.toString().includes("localhost")) {
                    resolve()
                }
            })
            setTimeout(reject, 10000, "Dev server boot took too long")
        })
    })

    afterAll(async () => {
        if (devProcess && !devProcess.killed) {
            devProcess.kill("SIGTERM")
        }
    })

    test("components html includes generated class name", async () => {
        const response = await fetch("http://localhost:5173")
        const html = await response.text()

        expect(html).toContain("<li class=\"css-8ubbtv\">")
    })

    test("generated stylesheet includes CSS-in-JS rules", async () => {
        const response = await fetch("http://localhost:5173/")
        const html = await response.text()

        expect(html).toContain(".css-8ubbtv{list-style:none;}")
    })
})

describe("build", () => {
    let serveProcess: ReturnType<typeof spawn>

    beforeAll(async () => {
        const buildProcess = spawn("node", [join(fixtureDir, "node_modules", "@react-router", "dev", "bin.js"), "build"], {
            cwd: fixtureDir,
        })

        await new Promise<void>((resolve, reject) => {
            buildProcess.on("exit", () => {
                resolve()
            })
            setTimeout(reject, 5000, "Build took too long")
        })

        serveProcess = spawn("node", [join(fixtureDir, "node_modules", "@react-router", "serve", "bin.js"), "./build/server/index.js"], {
            cwd: fixtureDir,
        })

        await new Promise<void>((resolve, reject) => {
            serveProcess.stdout!.on("data", (data) => {
                if (data.toString().includes("[react-router-serve]")) {
                    resolve()
                }
            })
        })
    })

    afterAll(async () => {
        if (serveProcess && !serveProcess.killed) {
            serveProcess.kill("SIGTERM")
        }
    })

    let responseHtml: string

    test("components html includes generated class name", async () => {
        const response = await fetch("http://localhost:3000")
        responseHtml = await response.text()

        expect(responseHtml).toContain("<li class=\"css-8ubbtv\">")
    })

    test("generated stylesheet includes CSS-in-JS rules", async () => {
        const stylesheetHref = responseHtml.match(/<link rel="stylesheet" href="(?<href>[^"]*)"\/>/g)
        const emotionCss = stylesheetHref?.at(-1)
        expect(emotionCss).toBeDefined()
        const href = emotionCss!.slice("<link rel=\"stylesheet\" href=\"".length, -"\"/>".length)
        const response = await fetch(new URL(href, "http://localhost:3000"))
        const css = await response.text()

        expect(css).toContain(".css-8ubbtv{list-style:none}")
    })
})
