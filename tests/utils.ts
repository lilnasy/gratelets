import { fileURLToPath } from "node:url"
import { join } from "node:path"
import { readFileSync, existsSync } from "node:fs"
import * as Astro from "astro"

export interface BuildFixture {
    outDir: string
    serverEntry: string
    resolve(path: string): string
    readTextFile(path: string): string
    fileExists(path: string): boolean
}

export async function build(root: `./fixtures/${string}` | URL, options: Astro.AstroInlineConfig = {}): Promise<BuildFixture> {
    const dist = `dist_${Date.now()}`
    await command("build", root, Object.assign(options, { outDir: dist }))
    // workaround for withastro/astro#12248
    const bugworkaround = options.output === "hybrid" || options.output === "server" ? "dist" : "."
    const resolve: BuildFixture["resolve"] = typeof root === "string"
        ? path => join(fileURLToPath(import.meta.url), "..", root, dist, bugworkaround, path)
        : path => join(fileURLToPath(root), dist, bugworkaround, path)
    return {
        outDir: resolve("."),
        serverEntry: resolve(`./server/entry.mjs`),
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

export async function dev(root: `./fixtures/${string}` | URL, options: Astro.AstroInlineConfig = {}): Promise<DevServer> {
    const server = await command("dev", root, options)
    return {
        address: server.address,
        stop: server.stop,
        fetch: path => fetch(`http://localhost:${server.address.port}${path}`).then(r => r.text())
    }
}

export type PreviewServer = Astro.PreviewServer

export async function preview(root: `./fixtures/${string}` | URL, options: Astro.AstroInlineConfig = {}) {
    return await command("preview", root, options)
}

async function command<Command extends "dev" | "build" | "preview">(
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
    }) as
        Command extends "dev" ? ReturnType<typeof Astro.dev> :
        Command extends "preview" ?  ReturnType<typeof Astro.preview> :
        void
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
