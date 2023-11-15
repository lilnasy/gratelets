import fs from "node:fs"
import type { AstroConfig, AstroIntegration } from "astro"
import { cachedCompilation } from "./node_modules/astro/dist/core/compile/cache.js"

interface Options {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-global",
        hooks: {
            "astro:config:setup": ({ updateConfig, config, logger }) => {
                updateConfig({
                    vite: {
                        plugins: [{
                            name: "astro-scope",
                            resolveId(source, importer) {
                                if (source === "astro:scope") return `astro:scope:${importer}.doesnotendwithtsdontprocessthispls`
                            },
                            async load(id) {
                                if (id.startsWith("astro:scope")) {
                                    const importer = id.slice("astro:scope:".length, -".doesnotendwithtsdontprocessthispls".length)
                                    console.log({ importer })
                                    const result = await cachedCompilation({
                                        astroConfig: config,
                                        viteConfig: config.vite,
                                        filename: importer,
                                        source: (await this.load({ id: importer })).id!
                                    })
                                    // @ts-expect-error what?
                                    return `export default ${JSON.stringify(result.scope)}`
                                }
                            }
                        }, {
                            name: "astro-global-inject-env-ts",
                            enforce: "post",
                            config() {
                                const envTsPath = new URL("env.d.ts", config.srcDir)
                                
                                let typesEnvContents: string
                                try { typesEnvContents = fs.readFileSync(envTsPath, "utf-8") }
                                catch { return }

                                if (typesEnvContents.includes('/// <reference types="astro-scope/client" />')) { return }
                                
                                const newTypesEnvContents = typesEnvContents.replace(
                                    '/// <reference types="astro/client" />',
                                    '/// <reference types="astro/client" />\n/// <reference types="astro-scope/client" />'
                                )
                                
                                if (newTypesEnvContents === typesEnvContents) { return }

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
