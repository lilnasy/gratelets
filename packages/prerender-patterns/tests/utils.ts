import { fileURLToPath } from "node:url"
import { readFileSync, existsSync } from "node:fs"
import * as Astro from "astro"

function resolve(relativePath: string) {
    return fileURLToPath(new URL(relativePath, import.meta.url))
}

export async function build(relativeRootPath: `./fixtures/${string}`, options?: Astro.AstroInlineConfig) {
    const root = resolve(relativeRootPath)
    await Astro.build({
        root,
        logLevel: "silent",
        ...options,
        vite: { logLevel: "silent", ...options?.vite },
    })
}

export function fileExists(path: string): boolean {
    return existsSync(resolve(path))
}

export function readTextFile(path: string): string {
    return readFileSync(resolve(path), "utf8").toString()
}

export function testAdapter(): Astro.AstroIntegration {
    return {
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
}
