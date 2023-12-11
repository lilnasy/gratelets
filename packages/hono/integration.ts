import { fileURLToPath } from "node:url"
import type { AstroAdapter, AstroIntegration } from "astro"
import type { RuntimeOptions } from "./runtime/server.ts"

export interface Options {
    mode: "middleware" | "standalone"
    host: string
    port: number
}

export function getAdapter(options: RuntimeOptions): AstroAdapter {
    return {
        name: "astro-hono",
        serverEntrypoint: "astro-hono/runtime/server.ts",
        previewEntrypoint: "astro-hono/runtime/preview.ts",
        exports: ["handler", "startServer", "options"],
        args: options,
        supportedAstroFeatures: {
            hybridOutput: "stable",
            staticOutput: "stable",
            serverOutput: "stable",
            assets: {
                supportKind: "stable",
                isSharpCompatible: true,
                isSquooshCompatible: true,
            }
        }
    }
}

export default function (options?: Partial<Options>): AstroIntegration {
    return {
        name: "astro-hono",
        hooks: {
            "astro:config:setup" ({ updateConfig, config }) {
                updateConfig({
                    image: {
                        endpoint: config.image.endpoint ?? "astro/assets/endpoint/node",
                    },
                    vite: {
                        define: {
                            "import.meta.env.ASTRO_HONO_STANDALONE": options?.mode === "middleware" ? "false" : "true"
                        },
                        ssr: {
                            noExternal: ["astro-hono"]
                        }
                    }
                })
            },
            "astro:config:done" ({ setAdapter, config }) {
                setAdapter(getAdapter({
                    mode: options?.mode,
                    host: options?.host,
                    port: options?.port,
                    client: fileURLToPath(config.build.client).replaceAll("\\", "/"),
                    server: fileURLToPath(config.build.server).replaceAll("\\", "/"),
                    assets: config.build.assets
                }))
            }
        }
    }
}
