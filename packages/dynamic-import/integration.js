// @ts-check
/// <reference path="./types.d.ts" />
import url from "node:url"
import path from "node:path"

// ./node_modules/astro/dist/core/index.js
const astroEntry = import.meta.resolve("astro")
const consts = new URL("../content/consts.js", astroEntry)
const { PROPAGATED_ASSET_FLAG } = await import(consts.href)

/**
 * Adds the ability to dynamically import components, while
 * including scripts and styles of only the picked components.
 * @param {{}=} _ Not used, the integration does not have any configuration options
 * @returns {import("astro").AstroIntegration}
 */
export default function (_) {
    return {
        name: "astro-dynamic-import",
        hooks: {
            "astro:config:setup"({ config, updateConfig }) {
                const srcDirName = path.relative(url.fileURLToPath(config.root), url.fileURLToPath(config.srcDir)).replaceAll("\\", "/")
                /** @type {import("vite").Plugin} */
                const plugin = {
                    name: "astro-dynamic-import/vite",
                    resolveId(source) {
                        if (source === "astro:import") { return this.resolve("astro-dynamic-import/runtime/virtual-module.ts") }
                        if (source === "astro-dynamic-import:internal") return source
                    },
                    load(id) {
                        if (id === "astro-dynamic-import:internal") {
                            return `export const srcDirName = ${JSON.stringify(srcDirName)}\n` +
                                `export const lookupMap = import.meta.glob('/${srcDirName}/components/**/*.astro', { query: { ${PROPAGATED_ASSET_FLAG}: true } })\n`
                        }
                    }
                }
                updateConfig({
                    vite: {
                        optimizeDeps: {
                            exclude: [ "astro-dynamic-import:internal" ],
                        },
                        plugins: [ plugin ]
                    }
                })
            }
        }
    }
}
