import type { AstroIntegration, AstroConfig } from "astro"
import url from "node:url"
import { parseAstroRequest } from "./node_modules/astro/dist/vite-plugin-astro/query.js"

export const prerender = "prerender"
export const renderOnDemand = "render on demand"

type Directive =
    | typeof prerender
    | typeof renderOnDemand

interface Callback {
    (path: string, currentDecision: Directive): Directive | undefined | null | void
}

export default function (callback?: Callback): AstroIntegration {
    const cache = new Map<string, ReturnType<Callback>>
    return {
        name: "prerender-patterns",
        hooks: {
            "astro:config:setup" ({ logger, config, updateConfig }) {
                if (callback === undefined) {
                    return logger.warn("No callback was provided. This integration will not do anything.")
                }
                else if (typeof callback !== "function") {
                    return logger.error(`The argument to this integration must be a function, but ${typeof callback} was provided instead.`)
                }
                updateConfig({ vite: { plugins: [{
                    name: "prerender-patterns",
                    outputOptions() {
                        const absolutePathPrefix = url.fileURLToPath(config.root).replaceAll("\\", "/")
                        
                        for (const moduleId of this.getModuleIds()) {
                            if (moduleId.startsWith(absolutePathPrefix) === false) continue
                            const moduleInfo = this.getModuleInfo(moduleId)
                            
                            const pageOptions = moduleInfo?.meta?.astro?.pageOptions
                            if (pageOptions === undefined) continue
                            
                            const current: boolean = pageOptions.prerender
                            const { filename } = parseAstroRequest(moduleId)
                            const relativePath = filename.slice(absolutePathPrefix.length)
                            
                            let override: ReturnType<Callback>
                            
                            if (cache.has(relativePath)) {
                                override = cache.get(relativePath)
                            } else {
                                override = callback(relativePath, current ? prerender : renderOnDemand)
                                cache.set(relativePath, override)
                            }
                            
                            if (override === undefined || override === null) continue
                            
                            else if (override === prerender) {
                                if (current === true) logger.debug(`${relativePath} is already prerendered.`)
                                else {
                                    pageOptions.prerender = true
                                    logger.debug(`${relativePath} will now be prerendered.`)
                                }
                            }
                            
                            else if (override === "render on demand") {
                                if (current === false) logger.debug(`${relativePath} is already being rendered on demand.`)
                                else {
                                    pageOptions.prerender = false
                                    logger.debug(`${relativePath} will now be rendered on demand.`)
                                }
                            }
                            
                            else if (typeof override === "boolean") {
                                logger.error(`Directive for ${relativePath} is not recognised: ${override}. Did you mean to return ${override ? `"${prerender}"` : `"${renderOnDemand}"`} instead?`)
                            }
                            
                            else {
                                logger.error(`Directive for ${relativePath} is not recognised. This will have no effect. Please make sure the directive is either "${prerender}" or "${renderOnDemand}".`)
                                console.error("Provided directive:", override)
                            }
                        }
                    }
                }] } })
            }
        }
    }
}
