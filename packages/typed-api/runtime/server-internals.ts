import type { APIRoute } from "astro"
import { encode, decode } from "es-codec"
import {
    AcceptHeaderMissing,
    UnsupportedClient,
    UnknownRequestFormat,
    InputNotDeserializable,
    ProcedureFailed,
    OutputNotSerializable,
    TypedAPIError
} from "./error.ts"
import { paramsToData } from "./param-codec.ts"
import type { TypedAPIContext } from "./server.ts"

export function createApiRoute(fetch: (input: unknown, content: TypedAPIContext) => unknown): APIRoute {
    return async function (ctx) {
        const { request } = ctx
        const { method, headers, url } = request
        const contentType = headers.get("Content-Type")
        const accept = headers.get("Accept")
        if (accept === null) throw new AcceptHeaderMissing(request)
        if (
            accept.includes("application/escodec") === false &&
            accept.includes("application/json") === false
        ) throw new UnsupportedClient(request)
        
        let input: any
        if (method === "GET") {
            const { searchParams } = new URL(url)
            input = Object.fromEntries(searchParams.entries())
            input = paramsToData(input)
        } else if (contentType === "application/json") {
            try {
                input = await request.json()
            } catch (error) {
                throw new InputNotDeserializable(error, url)
            }
        } else if (contentType === "application/escodec") {
            try {
                input = decode(await request.arrayBuffer())
            } catch (error) {
                throw new InputNotDeserializable(error, url)
            }
        } else throw new UnknownRequestFormat(request)
        
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
            output = await fetch(input, context)
        } catch (error) {
            if (error instanceof TypedAPIError) throw error
            throw new ProcedureFailed(error, url)
        }
        
        let outputBody
        if (accept.includes("application/escodec")) {
            try {
                outputBody = encode(output)
            } catch (error) {
                throw new OutputNotSerializable(error, url)
            }
            response.headers.set("Content-Type", "application/escodec")
        } else if (accept.includes("application/json")) {
            try {
                outputBody = JSON.stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, url)
            }
            response.headers.set("Content-Type", "application/json")
        }
        
        return new Response(outputBody, response)
    }
}
