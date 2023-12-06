import { transform } from "@babel/core"
import SBP from "@stylexjs/babel-plugin"
import type { AstroIntegration } from "astro"

interface Options { }

export default function (_: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-stylex",
        hooks: {
            "astro:config:setup": ({ updateConfig, logger }) => {
                const stylesheets: Record<string, unknown> = {}
                updateConfig({ vite: { plugins: [{
                    name: 'astro-stylex/vite',
                    async transform(code, id) {
                        if (code.includes("stylex") === false) return
                        logger.debug("transforming " + id)
                        const result = transform(code, {
                            babelrc: false,
                            filename: id,
                            plugins: [SBP]
                        }) as any
                        if (result?.metadata?.stylex?.length > 0 === false) return
                        stylesheets[id] = result.metadata.stylex
                        const newCode = result.code + `\nimport "${id}.astro_stylex_internal.css"\n`
                        const map = result.map
                        const metadata = result.metadata
                        return { code: newCode, map, meta: metadata }
                    },
                    resolveId(source) {
                        if (source.endsWith(".astro_stylex_internal.css")) return source
                    },
                    async load(id) {
                        if (id.endsWith(".astro_stylex_internal.css")) {
                            const sourceFileId = id.slice(0, -".astro_stylex_internal.css".length)
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
