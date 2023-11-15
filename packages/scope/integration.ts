import fs from "node:fs"
import { cachedCompilation } from "./node_modules/astro/dist/core/compile/cache.js"
import { parseAstroRequest } from "./node_modules/astro/dist/vite-plugin-astro/query.js"
import type { AstroConfig, AstroIntegration } from "astro"

interface Options {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-scope",
        hooks: {
            "astro:config:setup": ({ updateConfig, config, logger }) => {
                updateConfig({
                    vite: {
                        plugins: [{
                            name: "astro-scope",
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
                                
                                const result = await cachedCompilation({
                                    astroConfig: config,
                                    viteConfig: config.vite,
                                    filename,
                                    source: fs.readFileSync(filename, "utf-8")
                                })
                                
                                // @ts-expect-error what?!
                                return `export default ${JSON.stringify(result.scope)}`
                            }
                        }, {
                            name: "astro-global-inject-env-ts",
                            enforce: "post",
                            config() {
                                const envTsPath = new URL("env.d.ts", config.srcDir)
                                
                                let typesEnvContents: string
                                try { typesEnvContents = fs.readFileSync(envTsPath, "utf-8") }
                                catch { return }

                                if (typesEnvContents.includes('/// <reference types="astro-scope/client" />')) return
                                
                                const newTypesEnvContents = typesEnvContents.replace(
                                    '/// <reference types="astro/client" />',
                                    '/// <reference types="astro/client" />\n/// <reference types="astro-scope/client" />'
                                )
                                
                                if (newTypesEnvContents === typesEnvContents) return

                                fs.writeFileSync(envTsPath, newTypesEnvContents)

                                logger.info("Updated env.d.ts types")
                            }
                        }]
                    }
                } satisfies Partial<AstroConfig>)
            }
        }
    }
}

// the stacktrace is noisy and unhelpful 😠
class StacklessError extends Error { stack = undefined }
