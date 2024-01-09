//@ts-check
import {
    AstroCookies,
    Logger,
    RouteCache,
    createEnvironment,
    createRenderContext,
    renderPage,
    consoleLogDestination,
} from "./utils.js"

/**
 * @typedef {{
*     props?: Record<string, any>
*     slots?: Record<string, any>
* }} RenderOptions
*/

export class AstroCarton {
    #logger = new Logger({ dest: consoleLogDestination, level: "info" })
    #routeCache = new RouteCache(this.#logger)
    #env = createEnvironment({
        clientDirectives: new Map,
        compressHTML: true,
        logger: this.#logger,
        mode: "production",
        renderers: [],
        async resolve(path) { return path },
        routeCache: this.#routeCache,
        ssr: true,
        streaming: true
    })

    async renderToString(
       /** @type {any} */ Component,
       /** @type {RenderOptions} */ options,
    ) {
        const request = new Request("https://astro.carton/")
        const cookies = new AstroCookies(request)
        /** @type {any} */
        const route = null
        const mod = { default: Component }
        const renderContext = await createRenderContext({
            route,
            env: this.#env,
            mod,
            request,
        })
        const response = await renderPage({
            cookies,
            env: this.#env,
            mod,
            renderContext,
        })
        return response.text()
    }
}
