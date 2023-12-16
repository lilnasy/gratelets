import { fileURLToPath } from "node:url"
import { join } from "node:path"
import { readFileSync, existsSync } from "node:fs"
import * as Astro from "astro"

export interface BuildFixture {
    resolve(path: string): string
    readTextFile(path: string): string
    fileExists(path: string): boolean
}

export async function build(root: `./fixtures/${string}` | URL, options?: Astro.AstroInlineConfig): Promise<BuildFixture> {
    await command("build", root, options)
    const resolve: BuildFixture["resolve"] = typeof root === "string"
        ? path => join(fileURLToPath(import.meta.url), "..", root, "dist", path)
        : path => join(fileURLToPath(root), "dist", path)
    return {
        resolve,
        readTextFile: path => readFileSync(resolve(path), "utf8"),
        fileExists: path => existsSync(resolve(path))
    }
}

export interface DevServer {
    address: { address: string, port: number }
    stop(): Promise<void>
    fetch(path: string): Promise<string>
}

export async function dev(root: `./fixtures/${string}` | URL, options?: Astro.AstroInlineConfig): Promise<DevServer> {
    const server = await command("dev", root, options)
    return {
        address: server.address,
        stop: server.stop,
        fetch: path => fetch(`http://localhost:${server.address.port}${path}`).then(r => r.text())
    }
}

async function command<Command extends "dev" | "build">(
    command: Command,
    root_: string | URL,
    options?: Astro.AstroInlineConfig
) {
    const root = fileURLToPath(new URL(root_, import.meta.url))
    return await Astro[command]({
        root,
        logLevel: "silent",
        ...options,
        vite: {
            logLevel: "silent",
            build: {
                rollupOptions: {
                    logLevel: "silent",
                    ...options?.vite?.build?.rollupOptions
                },
                ...options?.vite?.build
            },
            ...options?.vite
        }
    }) as Command extends "dev" ? ReturnType<typeof Astro.dev> : void
}

export const testAdapter: Astro.AstroIntegration = {
    name: "test-adapter",
    hooks: {
        "astro:config:setup" ({ updateConfig }) {
            updateConfig({ vite: { plugins: [{
                name: "test-adapter-vite",
                resolveId(id) {
                    if (id === "virtual:adapter") return id
                },
                load(id) {
                    if (id === "virtual:adapter") {
                        return "export function createExports(manifest) {\n" +
                        "    return { manifest }\n" +
                        "}"
                    }
                }
            }] } })
        },
        "astro:config:done" ({ setAdapter }) {
            setAdapter({
                name: "test-adapter",
                serverEntrypoint: "virtual:adapter",
                exports: ["manifest"],
                supportedAstroFeatures: {}
            })
        }
    }
}
