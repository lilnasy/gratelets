import { parse, stringify } from "devalue"
import {
    MissingHTTPVerb,
    IncorrectHTTPVerb,
    ResponseNotOK,
    UnknownResponseFormat
} from "./errors.client.ts"

export function proxyTarget() {}

export const proxyHandler: ProxyHandler<typeof proxyTarget> & { path: string[] } = {
    path: [],
    get(target, prop) {
        const x = this
        if (typeof prop === "symbol") {
            throw new TypeError(`The typed API client cannot be keyed with ${String(prop)}.`)
        }
        return new Proxy(target, {
            ...proxyHandler,
            // @ts-expect-error Object literal may only specify known properties, and 'path'
            // does not exist in type 'ProxyHandler<() => void>'.
            path: [
                ...this.path,
                prop
            ]
        })
    },
    apply(target, thisArg, argArray) {
        const { path } = this
        const callType = path.pop()!
        const method = path.pop()!
        if (callType === "fetch") {
            return callFetch(path, method, argArray[0], argArray[1])
        } else if (callType === "subscribe") {
            return createEventSource(path, argArray[0], argArray[1])
        }
        return Reflect.apply(target, thisArg, argArray)
    },
}

interface ParamOptions {
    params?: Record<string, string>
}

interface FetchOptions extends RequestInit, ParamOptions {}

async function callFetch(segments: string[], method_: string, input: any, options?: FetchOptions) {
    
    const pathname = path(segments, options)
    
    const method = method_ === "ALL" ? options?.method : method_
    if (method === undefined) throw new MissingHTTPVerb(pathname)
    if (method !== method.toUpperCase()) throw new IncorrectHTTPVerb(method, pathname)
    
    const isGET = method === "GET"
    const url = new URL(pathname, location.origin)
    const headers = new Headers(options?.headers)
    headers.set("Accept",
        import.meta.env.TYPED_API_SERIALIZATION === "devalue"
            ? "application/devalue, application/json"
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
                headers.set("Content-Type", "application/devalue")
                body = stringify(input)
            } else {
                headers.set("Content-Type", "application/json")
                body = JSON.stringify(input)
            }
        }
    }

    const response = await fetch(url, { ...options, method, body, headers })

    if (response.ok === false) {
        throw new ResponseNotOK(response)
    }
    const contentType = response.headers.get("Content-Type")
    if (import.meta.env.TYPED_API_SERIALIZATION === "devalue" && contentType === "application/devalue") {
        return parse(await response.text())
    } else if (contentType === "application/json") {
        return await response.json()
    }
    throw new UnknownResponseFormat(response)
}

interface EventSourceOptions extends EventSourceInit, ParamOptions {}

async function createEventSource(segments: string[], input: any, options?: EventSourceOptions): Promise<AsyncIterator<any>> {
    const pathname = path(segments, options)
    const url = new URL(pathname, location.origin)
    if (input !== undefined) {
        if (import.meta.env.TYPED_API_SERIALIZATION === "devalue") {
            url.searchParams.set("input", stringify(input))
        } else {
            url.searchParams.set("input", JSON.stringify(input))
        }
    }
    const es = new EventSource(url, options)
    await new Promise((resolve, reject) => {
        es.onopen = resolve
        es.onerror = reject
    })
    return {
        next() {
            return new Promise((resolve, reject) => {
                es.onmessage = event => resolve({ value: event.data, done: false })
                es.onerror = reject
            })
        },
        async return() {
            es.close()
            return { value: undefined, done: true }
        }
    }
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
