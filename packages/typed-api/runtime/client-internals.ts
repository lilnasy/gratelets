import { encode, decode } from "es-codec"
import { IncorrectHTTPVerb, ResponseNotOK, UnknownFormat } from "./error.ts"
import { dataToParams } from "./param-codec.ts"

export const proxyTarget = { typedApiEndpoint: new Array<string> }
export const proxyHandler: ProxyHandler<typeof proxyTarget> = { get }

function get(target: typeof proxyTarget, prop: string) {
    if (typeof prop === "symbol") throw new TypeError(`The typed API client cannot be keyed with ${String(prop)}.`)
    const { typedApiEndpoint } = target
    if (prop === "fetch") {
        const method = typedApiEndpoint.pop()!
        return (input: any) => callServer(typedApiEndpoint, method, input)
    }
    return new Proxy({ typedApiEndpoint: [...typedApiEndpoint, prop] }, proxyHandler)
}

async function callServer(pathFragments: string[], method: string, input: any) {
    const { origin } = location
    const pathname = pathFragments.join("/")
    if (method !== method.toUpperCase()) throw new IncorrectHTTPVerb(method, pathname)
    const searchParams = method === "GET" ? "?" + String(new URLSearchParams(dataToParams(input))) : ""
    const body = method === "GET" ? undefined : encode(input)
    const headers = method === "GET" ? undefined : { "Content-Type": "application/escodec" }
    const url = new URL(pathname + searchParams, origin)
    const response = await fetch(url, { method, body, headers })
    if (response.ok === false) throw new ResponseNotOK(response)
    const contentType = response.headers.get("Content-Type")
    if (contentType !== "application/escodec") throw new UnknownFormat(pathname, contentType, response)
    const output = decode(await response.arrayBuffer())
    return output
}
