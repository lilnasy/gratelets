import { encode, decode } from "es-codec"
import {
    MissingHTTPVerb,
    IncorrectHTTPVerb,
    ResponseNotOK,
    UnknownResponseFormat
} from "./errors.ts"
import { dataToParams } from "./param-codec.ts"

export const proxyTarget = { typedApiEndpoint: new Array<string> }
export const proxyHandler: ProxyHandler<typeof proxyTarget> = { get }

interface Options extends RequestInit {
    params?: Record<string, string>
}

function get(target: typeof proxyTarget, prop: string) {
    if (typeof prop === "symbol") throw new TypeError(`The typed API client cannot be keyed with ${String(prop)}.`)
    const { typedApiEndpoint } = target
    if (prop === "fetch") {
        const method = typedApiEndpoint.pop()!
        return (input: any, options?: Options) => callServer(typedApiEndpoint, method, input, options)
    }
    return new Proxy({ typedApiEndpoint: [...typedApiEndpoint, prop] }, proxyHandler)
}

async function callServer(segments: string[], method_: string, input: any, options: Options = {}) {
    const { origin } = location
    let pathname_ = "/api"
    const { params } = options
    nextSegment:
    for (const segment of segments) {
        if (typeof params === "object") {
            for (const paramName in params) {
                if (segment === `_${paramName}` || segment === `_${paramName}_`) {
                    const paramValue = params[paramName]
                    pathname_ += "/" + paramValue
                    continue nextSegment
                }
            }
        }
        pathname_ += "/" + segment
    }
    if (import.meta.env.BASE_URL !== "/") {
        pathname_ = (import.meta.env.BASE_URL + pathname_).split("/").filter(Boolean).join("/")
    }
    if (import.meta.env._TRAILING_SLASH === "always") {
        if (pathname_.endsWith("/") === false) pathname_ += "/"
    }
    const pathname = pathname_
    const method = method_ === "ALL" ? options.method : method_
    if (method === undefined) throw new MissingHTTPVerb(pathname)
    if (method !== method.toUpperCase()) throw new IncorrectHTTPVerb(method, pathname)
    const isGET = method === "GET"
    const searchParams = isGET ? "?" + String(new URLSearchParams(dataToParams(input))) : ""
    const url = new URL(pathname + searchParams, origin)
    const headers = new Headers(options.headers)
    headers.set("Accept", "application/escodec, application/json")
    if (isGET === false) headers.set("Content-Type", "application/escodec")
    const body = isGET ? undefined : encode(input)
    const response = await fetch(url, { ...options, method, body, headers })
    if (response.ok === false) throw new ResponseNotOK(response)
    const contentType = response.headers.get("Content-Type")
    if (contentType === "application/escodec") return decode(await response.arrayBuffer())
    if (contentType === "application/json") return await response.json()
    throw new UnknownResponseFormat(response)
}
