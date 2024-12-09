import crypto from "node:crypto"
import { simple as walk } from "acorn-walk"
import createEmotion, { type Options as EmotionOptions } from "@emotion/css/create-instance"
import MagicString from "magic-string"
import { visitors, type State } from "./ast-scanner.ts"
import type { ModuleGraph, Plugin, TransformResult } from "vite"
import type { AstroIntegration } from "astro"
import "./types.d.ts"

interface Options extends EmotionOptions {}

export default function (options: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-emotion",
        hooks: {
            "astro:config:setup"({ updateConfig }) {
                updateConfig({ vite: { plugins: createVitePlugins(options) } })
            }
        }
    }
}

function createVitePlugins(options: Partial<Options>): [ Plugin, Plugin ] {
    
    /**
     * A cache of the js/ts files that have had their css extracted.
     * 
     * **key**: the source code of the js/ts file
     * 
     * **value**: the generated css code + js with styles replaced with class names
     */
    const transformCache = new Map<string, [ stylesheet: string, TransformResult]>
    
    /**
     * The up-to-date versions of the generated css files.
     * 
     * **key**: the virtual id of the css file (`/astro_emotion_internal_${hash}.css`)
     * 
     * **value**: the generated css code
     */
    const stylesheets = new Map<string, string>
    
    const { css, cache, flush, injectGlobal } = createEmotion({ key: "e", ...options })
    
    let moduleGraph: ModuleGraph

    return [{
        name: "astro-emotion/vite",
        configureServer(server) {
            moduleGraph = server.moduleGraph
        },
        transform(code, id) {
            if (code.includes("astro:emotion") === false) return
            const hash = crypto.hash("md5", id, "hex").slice(0, 8)
            const cssId = `/astro_emotion_internal_${hash}.css`
            const seen = transformCache.get(code)
            if (seen) {
                const [ stylesheet, transformResult ] = seen
                revalidate(moduleGraph, stylesheets, cssId, stylesheet)
                return transformResult
            }
            if (transformCache.size > 100) {
                transformCache.delete(transformCache.keys().next().value!)
            }
            const ast = this.parse(code)
            const magicString = new MagicString(code, { filename: id })
            const state: State = { id, css, injectGlobal, magicString }
            walk(ast, visitors, undefined, state)
            const stylesheet = Object.values(cache.inserted).join('\n')
            flush()
            revalidate(moduleGraph, stylesheets, cssId, stylesheet)
            magicString.prepend(`import ${JSON.stringify(cssId)}\n`)
            const transformResult: TransformResult = {
                code: magicString.toString(),
                map: magicString.generateMap({ hires: true })
            }
            transformCache.set(code, [ stylesheet, transformResult ])
            return transformResult
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
        name: "astro-emotion/vite/server",
        enforce: "post",
        apply: "serve",
        applyToEnvironment(environment) {
            return environment.config.consumer === "server"
        },
        transform(_, id) {
            const css = stylesheets.get(id)
            if (css) return `export default ${JSON.stringify(css)}`
        }
    }]
}

function revalidate(
    moduleGraph: ModuleGraph,
    stylesheets: Map<string, string>,
    cssId: string,
    stylesheet: string,
) {
    const existing = stylesheets.get(cssId)
    if (existing !== stylesheet) {
        stylesheets.set(cssId, stylesheet)
        const module = moduleGraph.getModuleById(cssId)
        if (module) {
            moduleGraph.invalidateModule(module)
            module.lastHMRTimestamp = Date.now()
        }
    }
}
