import type { APIRoute, APIContext, AstroGlobal } from "astro"
import type { TypeLevelMetadata } from "./internal.ts"
import { encode, decode } from "es-codec"

interface TypedAPIContext extends APIContext {
    response: AstroGlobal["response"]
}

interface TypedHandler<Input, Output> {
    validateInput?: unknown
    fetch(input: Input, context: TypedAPIContext): Promise<Output> | Output
}

export function defineApiRoute<
    Input,
    Output,
    Handler extends APIRoute | TypedHandler<Input, Output>
>(handler: Handler): APIRoute & (Handler extends TypedHandler<infer I, infer O> ? TypeLevelMetadata<{ input: I, output: O }> : never) {
    if ("fetch" in handler === false) return handler as any
    const apiRoute: APIRoute = async ctx => {
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
    return apiRoute as any
}

function stringToArrayBuffer(str: string) {
    return Uint8Array.from(str, c => c.charCodeAt(0)).buffer
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
