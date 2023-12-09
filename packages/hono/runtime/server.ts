import { App } from "astro/app"
import { applyPolyfills } from "astro/app/node"
import { Hono, type MiddlewareHandler } from "hono"
import { serve } from "@hono/node-server"
import { serveStatic } from "./serve-static.ts"
import type { SSRManifest } from "astro"
import type { Options } from "../integration.ts"

export interface RuntimeOptions extends Partial<Options> {
    client: string
    server: string
    assets: string
}

applyPolyfills()

export type Server = ReturnType<typeof startServer>
export type Handler = ReturnType<typeof middleware>
export interface Exports extends ReturnType<typeof createExports> {}

let handler: Handler

export function createExports(manifest: SSRManifest, options: RuntimeOptions) {
    handler ??= middleware(manifest, options)
    return {
        options: options,
        handler,
        startServer: () => startServer(handler, options)
    }
}

export function start(manifest: SSRManifest, options: RuntimeOptions) {
    if (options?.mode === "middleware" || process.env.ASTRO_HONO_AUTOSTART === "disabled") {
        return
    }
    handler ??= middleware(manifest, options)
    startServer(handler, options)
}

function startServer(handler: Handler, options: RuntimeOptions) {
    const { HOST, PORT } = process.env
    const hostname = options.host ?? HOST ?? "localhost"
    const port = options.port ?? (PORT ? parseInt(PORT) : 4321)
    const { fetch } = new Hono().use("*", handler)
    return serve({ fetch, hostname, port })
}

function middleware(manifest: SSRManifest, options: RuntimeOptions): MiddlewareHandler<{ Bindings: { locals?: {} } }> {
    const app = new App(manifest)
    const fourOhFour = manifest.routes.find(route => route.routeData.component.endsWith("/pages/404.astro"))?.routeData
    const staticFileMiddleware = serveStatic({ root: options.client })
    return async (context, next) => {
        const staticFileResponse = await staticFileMiddleware(context, async () => {})
        if (staticFileResponse) return staticFileResponse
        const request = context.req.raw
        const dynamicRoute = app.match(request)
        const routeData = dynamicRoute || fourOhFour
        const locals = context.env?.locals
        if (routeData) {
            const response = await app.render(request, { routeData, locals })
            for (const cookie of app.setCookieHeaders(response)) {
                response.headers.append("Set-Cookie", cookie)
            }
            return response
        }
        return await next()
    }
}
