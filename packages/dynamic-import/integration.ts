import url from "node:url"
import path from "node:path"
import fs from "node:fs"
import type { AstroConfig, AstroIntegration, AstroIntegrationLogger } from "astro"
import { PROPAGATED_ASSET_FLAG } from "./node_modules/astro/dist/content/consts.js"
import "./types.d.ts"

interface Options {}

export default function (_?: Options): AstroIntegration {
    return {
        name: "astro-dynamic-import",
        hooks: {
            "astro:config:setup" ({ config, updateConfig, logger }) {
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
                            `export const lookupMap = import.meta.glob('/${srcDirName}/components/**/*.astro', { query: { ${PROPAGATED_ASSET_FLAG}: true } })\n`
                        }
                    }
                }, {
                    name: "astro-dynamic-import/vite/types",
                    enforce: "post",
                    async config() {
                        injectEnvDTS(config, logger, "astro-dynamic-import/client")
                    }
                }] } })
            }
        }
    }
}

function injectEnvDTS(config: AstroConfig, logger: AstroIntegrationLogger, specifier: URL | string) {
    const envDTsPath = url.fileURLToPath(new URL("env.d.ts", config.srcDir))
    
    if (specifier instanceof URL) {
        specifier = url.fileURLToPath(specifier)
        specifier = path.relative(url.fileURLToPath(config.srcDir), specifier)
        specifier = specifier.replaceAll("\\", "/")
    }
    
    let envDTsContents = fs.readFileSync(envDTsPath, "utf-8")
    
    if (envDTsContents.includes(`/// <reference types='${specifier}' />`)) { return }
    if (envDTsContents.includes(`/// <reference types="${specifier}" />`)) { return }
    
    const newEnvDTsContents = envDTsContents.replace(
        `/// <reference types='astro/client' />`,
        `/// <reference types='astro/client' />\n/// <reference types='${specifier}' />\n`
    ).replace(
        `/// <reference types="astro/client" />`,
        `/// <reference types="astro/client" />\n/// <reference types="${specifier}" />\n`
    )
    
    // the odd case where the user changed the reference to astro/client
    if (newEnvDTsContents === envDTsContents) { return }
    
    fs.writeFileSync(envDTsPath, newEnvDTsContents)
    logger.info("Updated env.d.ts types")
}
