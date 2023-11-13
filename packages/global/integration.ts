import fs from "node:fs"
import type { AstroConfig, AstroIntegration } from "astro"

interface Options {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-global",
        hooks: {
            "astro:config:setup": ({ addMiddleware, updateConfig, config, logger }) => {
                addMiddleware({
                    entrypoint: "astro-global/runtime/middleware.ts",
                    order: "pre"
                })

                const extraConfig: Partial<AstroConfig> = {
                    vite: {
                        plugins: [{
                            name: "astro-global",
                            resolveId(source) {
                                if (source === "astro:global") return this.resolve("astro-global/runtime/virtual-module.ts")
                            }
                        }, {
                            name: "astro-global-inject-env-ts",
                            enforce: "post",
                            config() {
                                const envTsPath = new URL("env.d.ts", config.srcDir)
                                
                                let typesEnvContents: string
                                try { typesEnvContents = fs.readFileSync(envTsPath, "utf-8") }
                                catch { return }

                                if (typesEnvContents.includes('/// <reference types="astro-global/client" />')) { return }
                                
                                const newTypesEnvContents = typesEnvContents.replace(
                                    '/// <reference types="astro/client" />',
                                    '/// <reference types="astro/client" />\n/// <reference types="astro-global/client" />'
                                )
                                
                                if (newTypesEnvContents === typesEnvContents) { return }

                                fs.writeFileSync(envTsPath, newTypesEnvContents)
                                logger.info("Updated env.d.ts types")
                            }
                        }]
                    }
                }

                updateConfig(extraConfig)
            }
        }
    }
}
