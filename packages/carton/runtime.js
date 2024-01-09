/**
 * @typedef {{
*     props?: Record<string, any>
*     slots?: Record<string, any>
* }} RenderOptions
*/

export class AstroCarton {
    async renderToString(
       /** @type {any} */ Component,
       /** @type {RenderOptions} */ options,
    ) {
        const { Logger } = await import("astro/dist/core/logger/core.js")
        const logger = new Logger({ dest: consoleLogDestination, level: "info" })
        const { RouteCache } = await import("astro/dist/core/render/route-cache.js")
        const routeCache = new RouteCache(logger)
        const { consoleLogDestination } = await import("astro/dist/core/logger/console.js")
        const { createEnvironment }  = await import("astro/dist/core/render/index.js")
        const env = createEnvironment({
            clientDirectives: new Map,
            compressHTML: true,
            logger,
            mode: "production",
            renderers: [],
            async resolve(path) { return path },
            routeCache,
            ssr: true,
            streaming: true
        })
        const { renderPage } = await import("astro/dist/core/render/core.js")
        const { AstroCookies } = await import("astro/dist/core/cookies/cookies.js")
        const { createRenderContext } = await import("astro/dist/core/render/index.js")
        const request = new Request("https://astro.carton/")
        const cookies = new AstroCookies(request)
        /** @type {any} */
        const route = null
        const mod = { default: Component }
        const renderContext = await createRenderContext({
            route,
            env,
            mod,
            request,
        })
        const response = await renderPage({
            cookies,
            env,
            mod,
            renderContext,
        })
        return response.text()
    }
}
