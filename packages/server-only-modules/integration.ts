import type { AstroIntegration } from "astro"

interface Options {}

/**
 * Prevents modules with the extension `.server.ts` from being imported into client-side code.
 */
export default function (_?: Options): AstroIntegration {
    let buildingFor: "server" | "client" | undefined = undefined
    return {
        name: "server-only-modules",
        hooks: {
            "astro:config:setup" ({ updateConfig }) {
                updateConfig({ vite: { plugins: [{
                    name: "server-only-modules/vite",
                    load(specifier) {
                        if (buildingFor === "client") {
                            if (
                                specifier.endsWith(".server.ts") ||
                                specifier.endsWith(".server.mts") ||
                                specifier.endsWith(".server.cts") ||
                                specifier.endsWith(".server.tsx") ||
                                specifier.endsWith(".server.js") ||
                                specifier.endsWith(".server.mjs") ||
                                specifier.endsWith(".server.cjs") ||
                                specifier.endsWith(".server.jsx")
                            ) {
                                throw new ServerOnlyModule
                            }
                        }
                    },
                }] } })
            },
            "astro:build:setup" ({ target }) {
                buildingFor = target
            }
        }
    }
}

class ServerOnlyModule extends Error {
    name = "ServerOnlyModule"
    constructor() {
        super(`Cannot import a server-only module in the client build.`)
    }
}
