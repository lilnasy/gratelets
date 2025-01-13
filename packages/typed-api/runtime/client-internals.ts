import { parse, stringify } from "devalue"
import {
    CustomError,
    InvalidUsage,
    NetworkError,
    UnusableResponse,
} from "./errors.client.ts"

export function proxyTarget() {
    // still reachable with a [[Construct]] call, but
    // that would be intentional invalid usage
    throw new Error("Unreachable")
}

export const proxyHandler: ProxyHandler<typeof proxyTarget> & { path: string[] } = {
    path: [],
    get(target, prop) {
        if (typeof prop === "symbol") {
            throw new TypeError(`The typed API client cannot be keyed with ${String(prop)}.`)
        }
        return new Proxy(target, {
            ...proxyHandler,
            // @ts-expect-error "Object literal may only specify known properties, and 'path'
            // does not exist in type 'ProxyHandler<() => void>'.ts(2353)" The proxy handler
            // can have additional properties, and it becomes available as 'this' in the traps.
            path: [
                ...this.path,
                prop
            ]
        })
    },
    apply(target, thisArg, argArray) {
        const { path } = this
        const callType = path[path.length - 1]
        const method = path[path.length - 2]
        if (callType === "fetch") {
            return callFetch(path.slice(0, -2), method, argArray[0], argArray[1])
        }
        throw new InvalidUsage("incorrect call", callType)
    },
}

interface ParamOptions {
    params?: Record<string, string>
}

interface FetchOptions extends RequestInit, ParamOptions {}

async function callFetch(segments: string[], method_: string, input: any, options?: FetchOptions) {

    const pathname = path(segments, options)

    const method = method_ === "ALL" ? options?.method : method_
    if (method === undefined) throw new InvalidUsage("missing method", pathname)
    if (method !== method.toUpperCase()) throw new InvalidUsage("invalid method", pathname, method)

    const isGET = method === "GET"
    const url = new URL(pathname, location.origin)
    const headers = new Headers(options?.headers)
    headers.set("Accept",
        import.meta.env.TYPED_API_SERIALIZATION === "devalue"
            ? "application/devalue+json, application/json"
            : "application/json"
    )

    let body: BodyInit | null = null
    if (input !== undefined) {
        if (isGET) {
            if (import.meta.env.TYPED_API_SERIALIZATION === "devalue") {
                headers.set("Content-Type", "application/devalue-urlencoded")
                url.searchParams.set("input", stringify(input))
            } else {
                headers.set("Content-Type", "application/json-urlencoded")
                url.searchParams.set("input", JSON.stringify(input))
            }
        } else {
            if (import.meta.env.TYPED_API_SERIALIZATION === "devalue") {
                headers.set("Content-Type", "application/devalue+json")
                body = stringify(input)
            } else {
                headers.set("Content-Type", "application/json")
                body = JSON.stringify(input)
            }
        }
    }

    const request = new Request(url, { ...options, method, body, headers })
    let response: Response
    try {
        response = await fetch(request)
    } catch (error) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
        throw new NetworkError(error as TypeError)
    }

    const error = response.headers.get("X-Typed-Error")
    if (error) {
        const message = response.headers.get("X-Typed-Message") ?? undefined
        throw new CustomError(error, message)
    }

    if (response.ok === false) {
        throw new UnusableResponse("not ok", response)
    }
    const contentType = response.headers.get("Content-Type")
    if (import.meta.env.TYPED_API_SERIALIZATION === "devalue" && contentType === "application/devalue+json") {
        return parse(await response.text())
    } else if (contentType === "application/json") {
        return await response.json()
    }
    throw new UnusableResponse("unknown format", response)
}

function path(segments: string[], options?: ParamOptions) {
    let pathname = "/api"
    const params = options?.params
    nextSegment:
    for (const segment of segments) {
        if (typeof params === "object") {
            for (const paramName in params) {
                if (segment === `_${paramName}` || segment === `_${paramName}_`) {
                    const paramValue = params[paramName]
                    pathname += "/" + paramValue
                    continue nextSegment
                }
            }
        }
        pathname += "/" + segment
    }
    if (import.meta.env.BASE_URL !== "/") {
        pathname = (import.meta.env.BASE_URL + pathname).split("/").filter(Boolean).join("/")
    }
    if (import.meta.env._TRAILING_SLASH === "always") {
        if (pathname.endsWith("/") === false) pathname += "/"
    }
    return pathname
}
