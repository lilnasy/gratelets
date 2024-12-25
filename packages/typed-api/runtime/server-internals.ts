import type { APIRoute } from "astro"
import {
    AcceptHeaderMissing,
    UnsupportedClient,
    UnknownRequestFormat,
    InputNotDeserializable,
    ProcedureFailed,
    OutputNotSerializable,
    TypedAPIError
} from "./errors.ts"
import type { TypedAPIContext } from "./server.ts"
import { stringify, parse } from "devalue"

export function createApiRoute(fetchImpl: (input: unknown, content: TypedAPIContext) => unknown): APIRoute {
    return async function (ctx) {
        const { request, url: { pathname, searchParams} } = ctx
        const { headers } = request
        const contentType = headers.get("Content-Type")
        const accept = headers.get("Accept")
        if (accept === null) {
            throw new AcceptHeaderMissing(request)
        }
        if (
            accept.includes("application/devalue") === false &&
            accept.includes("application/json") === false
        ) {
            throw new UnsupportedClient(request)
        }
        let input: any
        if (contentType === "application/json-urlencoded") {
            input = searchParams.get("input")
            if (input) try {
                input = JSON.parse(input)
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType === "application/devalue-urlencoded") {
            input = searchParams.get("input")
            if (input) try {
                input = parse(input)
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType === "application/json") {
            try {
                input = await request.json()
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType === "application/devalue") {
            try {
                input = parse(await request.text())
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType !== null) {
            throw new UnknownRequestFormat(request)
        }
        
        const response = {
            status: 200,
            statusText: "OK",
            headers: new Headers
        }
        
        Object.defineProperty(response, "headers", {
            value: response.headers,
            enumerable: true,
            writable: false
        })
        
        const context: TypedAPIContext = Object.assign(ctx, { response })
        
        let output: any
        try {
            output = await fetchImpl(input, context)
        } catch (error) {
            if (error instanceof TypedAPIError) throw error
            const procedureFailed = new ProcedureFailed(error, pathname)
            if (import.meta.env.DEV) {
                // some errors are thrown intentionally
                // until a full error handling api is implemented, manually return 500 responses
                // to avoid dev overlay taking over the browser
                console.error(procedureFailed)
                return new Response(null, { status: 500 })
            }
            else {
                throw procedureFailed
            }
        }
        
        let outputBody: string | undefined = undefined
        if (accept.includes("application/devalue")) {
            try {
                outputBody = stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, pathname)
            }
            response.headers.set("Content-Type", "application/devalue")
        } else if (accept.includes("application/json")) {
            try {
                outputBody = JSON.stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, pathname)
            }
            response.headers.set("Content-Type", "application/json")
        }
        
        return new Response(outputBody, response)
    }
}
