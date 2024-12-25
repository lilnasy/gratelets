import { parse, stringify } from "devalue"
import {
    MissingHTTPVerb,
    IncorrectHTTPVerb,
    ResponseNotOK,
    UnknownResponseFormat
} from "./errors.ts"

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
            return callServer(path, method, argArray[0], argArray[1])
        }
        return Reflect.apply(target, thisArg, argArray)
    },
}

interface Options extends RequestInit {
    params?: Record<string, string>
}

async function callServer(segments: string[], method_: string, input: any, options: Options = {}) {
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
    const url = new URL(pathname, location.origin)
    const headers = new Headers(options.headers)
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
