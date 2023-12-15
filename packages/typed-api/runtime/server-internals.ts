import { encode, decode } from "es-codec"
import { TypedAPIError } from "./error.ts"
import type { APIRoute } from "astro"
import type { TypedAPIContext, TypedHandler } from "./server.ts"

let z: typeof import("zod") | undefined
try { z = await import("zod") } catch {}

export function createApiRoute(handler: TypedHandler<unknown, unknown>): APIRoute {
    return async function (ctx) {
        let input: any
        if (ctx.request.method === "GET") {
            const inputParam = new URL(ctx.request.url).searchParams.get("input")
            if (inputParam === null) return new Response("Bad Request", { status: 400 })
            try { input = decode(stringToArrayBuffer(inputParam)) }
            catch (error) { throw new TypedAPIError("The input for fetch handler could not be deserialized from the request.", error) }
        } else if (ctx.request.headers.get("Content-Type") === "application/escodec") {
            try { input = decode(await ctx.request.arrayBuffer()) }
            catch (error) { throw new TypedAPIError("The input for fetch handler could not be deserialized from the request.", error) }
        } else return new Response("Bad Request", { status: 400 })

        // if (handler.validateInput)
        
        const headers = new Headers({ "Content-Type": "application/escodec" })
        const response = { status: 200, statusText: "OK", headers }
        
        Object.defineProperty(response, "headers", {
            value: headers,
            enumerable: true,
            writable: false
        })
        
        const context: TypedAPIContext = Object.assign(ctx, { response })
        
        let output: any
        try { output = await handler.fetch(input, context) }
        catch (error) { throw new TypedAPIError("The fetch handler threw an error.", error) }
        
        let outputBody
        try { outputBody = encode(output) }
        catch (error) { throw new TypedAPIError("The output from fetch handler could not be serialized.", error) }
        
        return new Response(outputBody, response)
    }
}

function stringToArrayBuffer(str: string) {
    return Uint8Array.from(str, c => c.charCodeAt(0)).buffer
}
