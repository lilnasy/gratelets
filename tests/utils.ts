import { fileURLToPath } from "node:url"
import { readFileSync, existsSync } from "node:fs"
import * as Astro from "astro"

export async function dev(relativeRootPath: `./fixtures/${string}`, options?: Astro.AstroInlineConfig) {
    return command("dev", relativeRootPath, options)
}

export function build(relativeRootPath: `./fixtures/${string}`, options?: Astro.AstroInlineConfig) {
    return command("build", relativeRootPath, options)
}

async function command<Command extends "dev" | "build">(
    command: Command,
    relativeRootPath: string,
    options?: Astro.AstroInlineConfig
) {
    const root = resolve(relativeRootPath)
    return await Astro[command]({
        root,
        logLevel: "silent",
        ...options,
        vite: { logLevel: "silent", ...options?.vite },
    }) as Command extends "dev" ? ReturnType<typeof Astro.dev> : void
}

export const testAdapter: Astro.AstroIntegration = {
    name: "test-adapter",
    hooks: {
        "astro:config:setup": ({ updateConfig }) => {
            updateConfig({
                vite: {
                    plugins: [{
                        name: "test-adapter-vite",
                        resolveId(id) {
                            if (id === "virtual:adapter") return id
                        },
                        load(id) {
                            if (id === "virtual:adapter") return `
                                export function createExports(manifest) {
                                    return { manifest }
                                }
                            `
                        }
                    }]
                }
            } satisfies Partial<Astro.AstroConfig>)
        },
        "astro:config:done": ({ setAdapter }) => {
            setAdapter({
                name: "test-adapter",
                serverEntrypoint: "virtual:adapter",
                exports: ["manifest"]
            })
        }
    }
}

export function readTextFile(path: string): string {
    return readFileSync(resolve(path), "utf8").toString()
}

export function fileExists(path: string): boolean {
    return existsSync(resolve(path))
}

function resolve(relativePath: string) {
    return fileURLToPath(new URL(relativePath, import.meta.url))
}
