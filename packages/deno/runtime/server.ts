import { App } from "astro/app"
import contentTypes from "./content-types.ts"
import type { SSRManifest } from "astro"
import type { Options } from "../integration.ts"

polyfillProcessEnv()

declare const Deno: typeof import("../deno.ns.js").Deno
const importMeta = import.meta as any as import("../deno.ns.d.ts").ImportMeta
let server: import("../deno.ns.d.ts").Deno.Server | undefined

export function createExports(manifest: SSRManifest, _options: Options) {
	const app = new App(manifest)
    const handler = (request: Request, info: any) => handle(app, request, info)
    return { handler }
}

export function start(manifest: SSRManifest, options: Options) {
	if (importMeta.main !== true) return
	const app      = new App(manifest)
	const port     = options.port ?? Deno.env.has("PORT") ? parseInt(Deno.env.get("PORT")!) : 4321
	const hostname = options.hostname ?? Deno.env.get("HOST") ?? "localhost"
	return server  = Deno.serve({ port, hostname }, (req, info) => handle(app, req, info))
}

async function handle(
    app: App,
    request: Request,
    connInfo?: import("../deno.ns.d.ts").Deno.ServeHandlerInfo
) {
    if (app.match(request)) {
        Reflect.set(
            request,
            Symbol.for("astro.clientAddress"),
            {
                get() {
                    const hostname = connInfo?.remoteAddr?.hostname
                    if (hostname) return hostname
                    const cause = "Request handler was called without connection info."
                    throw new Error("Client address is not available.", { cause })
                }
            }
        )
        
        const response = await app.render(request)
        if (app.setCookieHeaders) {
            for (const setCookieHeader of app.setCookieHeaders(response)) {
                response.headers.append("Set-Cookie", setCookieHeader)
            }
        }
        return response
    }

    // If the request path wasn't found in astro ssr routes,
    // try to fetch a static file instead
    const requestedUrl = new URL(request.url)

    // import.meta.url is expected to be ./dist/server/entry.mjs
    const clientRoot = new URL("../client/", importMeta.url)
    const localPath = new URL("./" + app.removeBase(requestedUrl.pathname), clientRoot)

    // Try to find a static file matching the path
    try {
        const staticFileResponse = await fetch(localPath)
        const contentType : string | undefined = contentTypes[localPath.pathname.split(".").pop() as "css"]
        if (contentType) {
            return new Response(staticFileResponse.body, {
                ...staticFileResponse,
                headers: { ...staticFileResponse.headers, "Content-Type": contentType }
            })
        }
        return staticFileResponse
    } catch {}

    // Try to find a prerendered `index.html` matching the path
    for (const file of getPrerenderedFiles(clientRoot)) {
        const pathname = file.pathname.replace(/\/(index)?\.html$/, "")
        if (localPath.pathname.replace(/\/$/, '').endsWith(pathname)) {
            const _response = await fetch(file)
            return new Response(_response.body, {
                ..._response,
                headers: { ..._response.headers, "Content-Type": "text/html" }
            })
        }
    }

    // Render the astro custom 404 page
    const response = await app.render(request)

    if (app.setCookieHeaders) {
        for (const setCookieHeader of app.setCookieHeaders(response)) {
            response.headers.append("Set-Cookie", setCookieHeader)
        }
    }
    return response
}

function polyfillProcessEnv() {
	// @ts-ignore
	globalThis.process ??= {
		argv: [],
		env: Deno.env.toObject(),
	}
}

function* getPrerenderedFiles(clientRoot: URL): Generator<URL> {
	for (const ent of Deno.readDirSync(clientRoot)) {
		if (ent.isDirectory) {
			yield* getPrerenderedFiles(new URL(`./${ent.name}/`, clientRoot))
		} else if (ent.name.endsWith(".html")) {
			yield new URL(`./${ent.name}`, clientRoot)
		}
	}
}
