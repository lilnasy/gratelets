import fs from "node:fs"
import url from "node:url"
import path from "node:path"
import { simple as walk } from "acorn-walk"
import createEmotion from "@emotion/css/create-instance"
import MagicString from "magic-string"
import { visitors, type State } from "./ast-scanner.ts"
import type { AstroConfig, AstroIntegration, AstroIntegrationLogger } from "astro"

interface Options {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-emotion",
        hooks: {
            "astro:config:setup": ({ updateConfig, config, logger }) => {
                const stylesheets = new Array<string>
                const { css, cache, flush, injectGlobal } = createEmotion({ key: "e" })
                updateConfig({ vite: { plugins: [{
                    name: "astro-emotion/vite",
                    transform(code, id, { ssr } = {}) {
                        if (code.includes("astro:emotion") === false) return
                        const ast = this.parse(code)
                        const magicString = new MagicString(code, { filename: id })
                        const state: State = { id, css, injectGlobal, magicString }
                        walk(ast, visitors, undefined, state)
                        const stylesheetCount = stylesheets.push(Object.values(cache.inserted).join('\n'))
                        flush()
                        if (ssr) magicString.prepend(`import "astro_emotion_internal_${stylesheetCount - 1}.css"\n`)
                        const newCode = magicString.toString()
                        const map = magicString.generateMap({ hires: true })
                        return { code: newCode, map }
                    },
                    resolveId(source) {
                        if (source.startsWith("astro_emotion_internal_")) return source
                    },
                    load(id) {
                        if (id.startsWith("astro_emotion_internal_")) {
                            const index = parseInt(id.slice("astro_emotion_internal_".length, -".css".length))
                            const sheet = stylesheets[index]
                            return sheet
                        }
                        // HACK: vite also attempts to import styles for HMR which is not handled by the integration
                        if (id.startsWith("/astro_emotion_internal_")) {
                            return "/* astro-emotion does not support HMR */"
                        }
                    }
                }, {
                    name: "astro-emotion/vite/types",
                    enforce: "post",
                    config() {
                        injectEnvDTS(config, logger, "astro-emotion/client")
                    }
                }] } } satisfies Partial<AstroConfig>)
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
