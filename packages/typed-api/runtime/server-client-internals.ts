/**
 * Includes code for the `api` object when it is imported in a server module.
 * 
 * Implements a shorter circuit because both the caller and the
 * called function are in the same process.
 * 
 * The current request's APIContext is reused for typed api context.
 * 
 * Request options (headers, etc) are completely ignored.
 * 
 * No serialization/deserialization is involved.
 * 
 * Validation is not performed, although it can be implemented.
 * 
 * Custom error handling is not going to work, the 500 response
 * object is returned as-is.
 * 
 * All of this is probably okay for most use-cases calling api
 * from a server module.
 * 
 * If it is not okay, the behavior can be made more sophisticated
 * as use-cases require.
 */

import { InvalidUsage } from "./errors.client.ts"
import { apiContextStorage } from "./api-context-storage.ts"
import type { TypedAPIContext } from "./server.ts"
import { ErrorResponse } from "./error-response.ts"
import type { APIContext } from "astro"

const apiGlob = import.meta.glob(import.meta.env._API_DIR + "**/*.{ts,mts}")

export const proxyHandler: ProxyHandler<Function> & { path: string[] } = {
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
    async apply(target, thisArg, argArray) {
        const { path } = this
        const callType = path[path.length - 1]
        const method = path[path.length - 2]
        if (callType === "fetch") {
            const endpoint = path.slice(0, -2).join("/")
            const matches: string[] = []
            for (const api in apiGlob) {
                if (api.includes(endpoint)) {
                    matches.push(api)
                }
            }
            if (matches.length === 0) {
                throw new Error(`No API endpoint found for ${endpoint}`)
            }
            const shortestMatch = matches.sort((a, b) => a.length - b.length)[0]
            const api: any = await apiGlob[shortestMatch]()
            const astroApiContext = apiContextStorage.getStore()!
            const typedApiContext: TypedAPIContext = Object.setPrototypeOf(
                {
                    response: {
                        status: 200,
                        statusText: "OK",
                        headers: new Headers
                    },
                    error(details, response) {
                        return new ErrorResponse(details, response)
                    }
                } satisfies Omit<TypedAPIContext, keyof APIContext>,
                astroApiContext
            )
            return await api[method].fetch(argArray[0], typedApiContext)
        }
        throw new InvalidUsage("incorrect call", callType)
    },
}
