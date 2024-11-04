import fs from "node:fs"
import url from "node:url"
import path from "node:path"
import crypto from "node:crypto"
import { simple as walk } from "acorn-walk"
import createEmotion, { type Options as EmotionOptions } from "@emotion/css/create-instance"
import MagicString from "magic-string"
import { visitors, type State } from "./ast-scanner.ts"
import type { AstroConfig, AstroIntegration, AstroIntegrationLogger } from "astro"

interface Options extends EmotionOptions {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-emotion",
        hooks: {
            "astro:config:setup": ({ updateConfig, config, logger }) => {
                const stylesheets = new Map<string, string>
                const { css, cache, flush, injectGlobal } = createEmotion({ key: "e", ...options })
                let moduleGraph: import("vite").ModuleGraph
                updateConfig({ vite: { plugins: [{
                    name: "astro-emotion/vite",
                    configureServer(server) {
                        moduleGraph = server.moduleGraph
                    },
                    handleHotUpdate({ modules }) {
                        for (const mod of modules) {
                            for (const imported of mod.clientImportedModules.values()) {
                                if (stylesheets.has(imported.id ?? "")) modules.push(imported)
                            }
                        }
                    },
                    transform(code, id) {
                        if (code.includes("astro:emotion") === false) return
                        const ast = this.parse(code)
                        const magicString = new MagicString(code, { filename: id })
                        const state: State = { id, css, injectGlobal, magicString }
                        walk(ast, visitors, undefined, state)
                        const stylesheet = Object.values(cache.inserted).join('\n')
                        flush()
                        const hash = crypto.hash("md5", id, "hex").slice(0, 8)
                        const cssId = `/astro_emotion_internal_${hash}.css`
                        const update = stylesheets.has(cssId)
                        stylesheets.set(cssId, stylesheet)
                        if (update) {
                            const module = moduleGraph.getModuleById(cssId)
                            if (module) moduleGraph.invalidateModule(module)
                        }
                        magicString.prepend(`import ${JSON.stringify(cssId)}\n`)
                        const newCode = magicString.toString()
                        const map = magicString.generateMap({ hires: true })
                        return { code: newCode, map }
                    },
                    resolveId(source) {
                        if (stylesheets.has(source)) return source
                        // HACK: prevent warnings from vite when it scans a file before letting it be transformed
                        if (source === "astro:emotion") return source
                    },
                    load(id) {
                        return stylesheets.get(id)
                    }
                }, {
                    name: "astro-emotion/vite/types",
                    enforce: "post",
                    config() {
                        injectEnvDTS(config, logger, "astro-emotion/client")
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
