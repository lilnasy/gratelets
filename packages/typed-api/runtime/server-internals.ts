import type { APIRoute } from "astro"
import { encode, decode } from "es-codec"
import { AcceptHeaderMissing, InputNotDeserializable, UnknownRequestFormat, ProcedureFailed, OutputNotSerializable } from "./error.ts"
import { paramsToData } from "./param-codec.ts"
import type { TypedAPIContext } from "./server.ts"

export function createApiRoute(fetch: (input: unknown, content: TypedAPIContext) => unknown): APIRoute {
    return async function (ctx) {
        const contentType = ctx.request.headers.get("Content-Type")
        const accept = ctx.request.headers.get("Accept")
        if (accept === null) throw new AcceptHeaderMissing(ctx.request)
        if (
            accept.includes("application/json") === false &&
            accept.includes("application/escodec") === false
        ) throw new UnknownRequestFormat(ctx.request)
        
        let input: any
        if (ctx.request.method === "GET") {
            const { searchParams } = new URL(ctx.request.url)
            input = Object.fromEntries(searchParams.entries())
            input = paramsToData(input)
        } else if (contentType === "application/json") {
            try {
                input = await ctx.request.json()
            } catch (error) {
                throw new InputNotDeserializable(error, ctx.request.url)
            }
        } else if (contentType === "application/escodec") {
            try {
                input = decode(await ctx.request.arrayBuffer())
            } catch (error) {
                throw new InputNotDeserializable(error, ctx.request.url)
            }
        } else throw new UnknownRequestFormat(ctx.request)
        
        const headers = new Headers({ "Content-Type": "application/escodec" })
        const response = { status: 200, statusText: "OK", headers }
        
        Object.defineProperty(response, "headers", {
            value: headers,
            enumerable: true,
            writable: false
        })
        
        const context: TypedAPIContext = Object.assign(ctx, { response })
        
        let output: any
        try {
            output = await fetch(input, context)
        } catch (error) {
            throw new ProcedureFailed(error,ctx.request.url)
        }
        
        let outputBody
        if (accept.includes("application/escodec")) {
            try {
                outputBody = encode(output)
            } catch (error) {
                throw new OutputNotSerializable(error, ctx.request.url)
            }
            headers.set("Content-Type", "application/escodec")
        } else if (accept.includes("application/json")) {
            try {
                outputBody = JSON.stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, ctx.request.url)
            }
            headers.set("Content-Type", "application/json")
        }
        
        return new Response(outputBody, response)
    }
}
