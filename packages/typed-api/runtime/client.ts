import { encode, decode } from "es-codec"

declare global {
    namespace TypedAPI {
        interface Client {}
    }
}

const proxyTarget = { typedApiEndpoint: new Array<string> }
const proxyHandler: ProxyHandler<typeof proxyTarget> = { get }
export const client: TypedAPI.Client = new Proxy(proxyTarget, proxyHandler) as any

function get(target: typeof proxyTarget, prop: string) {
    if (typeof prop === "symbol") throw new TypedAPIError("The typed API cannot be keyed with a symbol.", prop)
    const { typedApiEndpoint } = target
    if (prop === "fetch") {
        const method = typedApiEndpoint.pop()!
        return (input: any) => callServer(typedApiEndpoint, method, input)
    }
    return new Proxy({ typedApiEndpoint: [...typedApiEndpoint, prop] }, proxyHandler)
}

async function callServer(pathFragments: string[], method: string, input: any) {
    if (method !== method.toUpperCase()) throw new TypedAPIError(`The method (${method}) should have been uppercase.`)
    const url = new URL("/" + pathFragments.join("/"))
    let body: ArrayBuffer | undefined = undefined
    if (method === "GET") url.searchParams.set("input", arrayBufferToString(encode(input)))
    else body = encode(input)
    const headers = method === "GET" ? undefined : { "Content-Type": "application/escodec" }
    const response = await fetch(url, { method, body, headers })
    if (response.ok === false) throw new TypedAPIError("The API call was unsuccessfull.", response)
    if (response.headers.get("Content-Type") !== "application/escodec") throw new TypedAPIError("The API call was successfull, but the response was not in the expected format.", response)
    const output = decode(await response.arrayBuffer())
    return output
}

function arrayBufferToString(buf: ArrayBuffer) {
    return String.fromCharCode(...new Uint8Array(buf))
}

class TypedAPIError extends Error {
    name = "TypedAPIError"
    constructor(message: string, cause?: any) {
        super(message, { cause })
    }
}
