import url from "node:url"
import { transform } from "@babel/core"
import SBP from "@stylexjs/babel-plugin"
import type { AstroIntegration } from "astro"

interface Options { }

export default function (_: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-stylex",
        hooks: {
            "astro:config:setup": ({ config, updateConfig, logger }) => {
                const unstable_moduleResolution = {                    
                    // https://github.com/facebook/stylex/blob/3405b5bfd27df4ae4fa7cbb3b5520a3fa71d7f46/apps/docs/docs/api/configuration/babel-plugin.mdx#L133
                    // "Use this value when using ES Modules" wtf
                    type: "commonJS",
                    rootDir: url.fileURLToPath(config.root)
                }
                const stylesheets: Record<string, unknown> = {}
                updateConfig({ vite: { plugins: [{
                    name: "astro-stylex/vite",
                    async transform(code, id) {
                        if (code.includes("stylex") === false) return
                        logger.debug("transforming " + id)
                        const result = transform(code, {
                            babelrc: false,
                            filename: id,
                            plugins: [[SBP, { unstable_moduleResolution }]]
                        }) as any
                        logger.debug("transformed " + id)
                        if (result?.metadata?.stylex?.length > 0 === false) return
                        stylesheets[id] = result.metadata.stylex
                        const newCode = result.code + `\nimport "${id}.astro_stylex_internal.css?time=${Date.now()}&astro-stylex&lang.css"\n`
                        const map = result.map
                        const metadata = result.metadata
                        return { code: newCode, map, meta: metadata }
                    },
                    resolveId(source) {
                        if (source.endsWith("astro-stylex&lang.css")) return source
                    },
                    async load(id) {
                        const [source, query] = id.split(`?`, 2)
                        const params = new URLSearchParams(query)
                        if (params.has("astro-stylex")) {
                            const sourceFileId = source.slice(0, -".astro_stylex_internal.css".length)
                            const { id: resolvedId } = await this.resolve(sourceFileId) ?? {}
                            if (resolvedId === undefined) return logger.error("Could not find the real path for " + sourceFileId)
                            const generatedCss = stylesheets[resolvedId]
                            if (generatedCss === undefined) return logger.error("Could not find StyleX-compiled CSS for " + resolvedId)
                            // @ts-expect-error
                            const code: string = SBP.processStylexRules(generatedCss, true)
                            return code
                        }
                    }
                }] } })
            }
        }
    }
}
