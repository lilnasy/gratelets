import url from "node:url"
import path from "node:path"
import type { AstroIntegration } from "astro"
import "./types.d.ts"

/**
 * Not used, the integration does not have any configuration options
 */
interface Options {}

/**
 * Adds the ability to dynamically import components,
 * including scripts and styles of only the picked components.
 */
export default function (_?: Options): AstroIntegration {
    return {
        name: "astro-dynamic-import",
        hooks: {
            "astro:config:setup" ({ config, updateConfig }) {
                const srcDirName = path.relative(url.fileURLToPath(config.root), url.fileURLToPath(config.srcDir)).replaceAll("\\", "/")
                updateConfig({ vite: { 
                  optimizeDeps: {
                    exclude: ["astro-dynamic-import:internal"],
                  },
                  plugins: [{
                    name: "astro-dynamic-import/vite",
                    resolveId(source) {
                        if (source === "astro:import") { return this.resolve("astro-dynamic-import/runtime/virtual-module.ts") }
                        if (source === "astro-dynamic-import:internal") return source
                    },
                    load(id) {
                        if (id === "astro-dynamic-import:internal") {
                            return `export const srcDirName = ${JSON.stringify(srcDirName)}\n` +
                            `export const lookupMap = import.meta.glob('/${srcDirName}/components/**/*.astro', { query: { astroPropagatedAssets: true } })\n`
                        }
                    }
                }]}})
            }
        }
    }
}
