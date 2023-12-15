import fs from "node:fs"
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

let app: App
let handler: Handler

export function createExports(manifest: SSRManifest, options: RuntimeOptions) {
    app ??= new App(manifest)
    handler ??= middleware(manifest, options)
    return {
        options: options,
        handler,
        startServer: import.meta.env.ASTRO_HONO_STANDALONE ? () => startServer(handler, options) : null
    }
}

export function start(manifest: SSRManifest, options: RuntimeOptions) {
    if (import.meta.env.ASTRO_HONO_STANDALONE === false || process.env.ASTRO_HONO_AUTOSTART === "disabled") {
        return
    }
    app ??= new App(manifest)
    handler ??= middleware(manifest, options)
    startServer(handler, options)
}

function startServer(handler: Handler, options: RuntimeOptions) {
    const logger = app.getAdapterLogger()
    const { HOST, PORT } = process.env
    const hostname = options.host ?? HOST ?? "localhost"
    const port = options.port ?? (PORT ? parseInt(PORT) : 4321)
    const { fetch } = new Hono().use("*", handler)
    const server =  serve({ fetch, hostname, port })
    server.on("listening", () => {
        const address = server.address()
        if (address === null) return
        if (typeof address === "string") return logger.info(`Listening on ${address}`)
        logger.info(`Listening on http://${address.address}:${address.port}`)
    })
    server.on("close", () => logger.info("Server closed"))
    return Object.assign(server, {
        destroy() {
            return new Promise<void>((resolve, reject) => {
                server.close(err => err ? reject(err) : resolve())
            })
        }
    })
}

function middleware(manifest: SSRManifest, options: RuntimeOptions): MiddlewareHandler<{ Bindings: { locals?: {} } }> {
    const staticFileMiddleware = serveStatic({ root: options.client, rewriteRequestPath: app.removeBase.bind(app) })
    const fourOhFour = get404(manifest, options)
    const fourOhFourRoute = fourOhFour instanceof Response ? void 0 : fourOhFour
    
    return async (context, next) => {
        const staticFileResponse = await staticFileMiddleware(context, async () => {})
        if (staticFileResponse) return staticFileResponse
        const request = context.req.raw
        const dynamicRoute = app.match(request)
        const routeData = dynamicRoute || fourOhFourRoute
        const locals = context.env?.locals
        if (routeData) {
            let request_ = request
            if (request.headers.get("X-Forwarded-Proto") === "https") {
                const url = new URL(request.url)
                url.protocol = "https"
                request_ = new Request(url, request)
            }
            const response = await app.render(request_, { routeData, locals })
            for (const cookie of app.setCookieHeaders(response)) {
                response.headers.append("Set-Cookie", cookie)
            }
            return response
        }
        if (fourOhFour instanceof Response) return fourOhFour.clone()
        return await next()
    }
}

function get404(manifest: SSRManifest, options: RuntimeOptions) {
    const routeInfo = manifest.routes.find(route => route.routeData.component.endsWith("/pages/404.astro"))
    if (routeInfo === undefined) return
    if (routeInfo.routeData.prerender === false) return routeInfo.routeData
    return new Response(fs.readFileSync(options.client + routeInfo.file, "utf8"), {
        status: 404,
        headers: { "Content-Type": "text/html" }
    })
}
