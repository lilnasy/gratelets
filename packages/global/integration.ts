import type { AstroConfig, AstroIntegration } from "astro"
import "./types.d.ts"

interface Options {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-global",
        hooks: {
            "astro:config:setup"({ addMiddleware, updateConfig }) {
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
                        }]
                    }
                }

                updateConfig(extraConfig)
            }
        }
    }
}
