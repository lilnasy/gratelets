import fs from "node:fs"
import { compile } from "./node_modules/astro/dist/core/compile/index.js"
import { parseAstroRequest } from "./node_modules/astro/dist/vite-plugin-astro/query.js"
import type { AstroConfig, AstroIntegration } from "astro"
import type { ResolvedConfig } from "vite"
import "./types.d.ts"

interface Options {}

export default function (_: Partial<Options> = {}): AstroIntegration {
    let viteConfig: ResolvedConfig
    let astroConfig: AstroConfig
    return {
        name: "astro-scope",
        hooks: {
            "astro:config:setup"({ updateConfig, logger }) {
                updateConfig({
                    vite: {
                        plugins: [{
                            name: "astro-scope",
                            configResolved(resolvedConfig) {
                                viteConfig = resolvedConfig
                            },
                            resolveId(source, importer) {
                                if (source !== "astro:scope") return

                                if (importer === undefined) throw new Error("Vite's resolveId should never be called without an importer. This is an internal error. Please open an issue with reproduction steps.")
                                
                                const { filename } = parseAstroRequest(importer)
                                
                                if (filename.endsWith(".astro") === false) {
                                    logger.error(`'astro:scope' was imported by ${importer}`)
                                    throw new StacklessError("astro:scope can only be used in .astro files")
                                }
                                
                                return `astro:scope:${filename}.doesnotendwithastrodontprocessthispls`
                            },
                            async load(id) {
                                if (!id.startsWith("astro:scope")) return

                                const filename = id.slice("astro:scope:".length, -".doesnotendwithastrodontprocessthispls".length)
                                
                                const result = await compile({
                                    astroConfig,
                                    viteConfig,
                                    filename,
                                    source: fs.readFileSync(filename, "utf-8"),
                                    preferences: { get() {} } as any
                                })
                                
                                return `export default ${JSON.stringify(result.scope)}`
                            }
                        }]
                    }
                })
            },
            "astro:config:done"({ config }) {
                astroConfig = config
            }
        }
    }
}

// the stacktrace is noisy and unhelpful 😠
class StacklessError extends Error { stack = undefined }
