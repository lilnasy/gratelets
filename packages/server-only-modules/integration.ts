import type { AstroIntegration } from "astro"

interface Options {}

export default function (_?: Options): AstroIntegration {
    let buildingFor: "server" | "client" | undefined = undefined
    return {
        name: "server-only-modules",
        hooks: {
            "astro:config:setup" ({ updateConfig }) {
                updateConfig({ vite: { plugins: [{
                    name: "server-only-modules/vite",
                    load(specifier) {
                        if (specifier.endsWith(".server.ts") && buildingFor === "client") {
                            throw new Error(`Cannot import ${specifier} in the ${buildingFor} build.`)
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
