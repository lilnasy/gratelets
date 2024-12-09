import type { AstroIntegration } from "astro"
import url from "node:url"

interface Options {}

export default function (_?: Options): AstroIntegration {
    return {
        name: "adds-to-head",
        hooks: {
            "astro:config:setup" ({ config, updateConfig, logger }) {
                const rootPath = url.fileURLToPath(config.root).replaceAll("\\", "/")

                updateConfig({
                    vite: {
                        plugins: [{
                            name: "adds-to-head",
                            transform(code, id) {
                                if (id.startsWith(rootPath) === false) return

                                const moduleInfo = this.getModuleInfo(id)
                                if (moduleInfo === undefined || moduleInfo === null) return
                                
                                const metadata = moduleInfo?.meta?.astro
                                if (metadata === undefined) return

                                if (
                                    code.includes("export const addsToHead = true;") ||
                                    code.includes("export let addsToHead = true;")
                                ) {
                                    logger.debug(`${id.slice(rootPath.length)} will now propagate assets.`)
                                    metadata.propagation = "self"
                                }
                            }
                        }]
                    }
                })
            }
        }
    }
}
