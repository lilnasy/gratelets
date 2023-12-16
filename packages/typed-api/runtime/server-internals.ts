import type { APIRoute } from "astro"
import { encode, decode } from "es-codec"
import { InputNotDeserializable, ProcedureFailed, OutputNotSerializable } from "./error.ts"
import { paramsToData } from "./param-codec.ts"
import type { TypedAPIContext } from "./server.ts"

export function createApiRoute(fetch: (input: unknown, content: TypedAPIContext) => unknown): APIRoute {
    return async function (ctx) {
        let input: any
        if (ctx.request.method === "GET") {
            const { searchParams } = new URL(ctx.request.url)
            input = Object.fromEntries(searchParams.entries())
            input = paramsToData(input)
        } else if (ctx.request.headers.get("Content-Type") === "application/json") {
            try { input = await ctx.request.json() }
            catch (error) { throw new InputNotDeserializable(error, ctx.request.url) }
        } else if (ctx.request.headers.get("Content-Type") === "application/escodec") {
            try { input = decode(await ctx.request.arrayBuffer()) }
            catch (error) { throw new InputNotDeserializable(error, ctx.request.url) }
        } else return new Response("Bad Request", { status: 400 })
        
        const headers = new Headers({ "Content-Type": "application/escodec" })
        const response = { status: 200, statusText: "OK", headers }
        
        Object.defineProperty(response, "headers", {
            value: headers,
            enumerable: true,
            writable: false
        })
        
        const context: TypedAPIContext = Object.assign(ctx, { response })
        
        let output: any
        try { output = await fetch(input, context) }
        catch (error) { throw new ProcedureFailed(error,ctx.request.url) }
        
        let outputBody
        try { outputBody = encode(output) }
        catch (error) { throw new OutputNotSerializable(error, ctx.request.url) }
        
        return new Response(outputBody, response)
    }
}
