import { ZodNotInstalled, InvalidSchema, ValidationFailed } from "./error.ts"
import { createApiRoute } from "./server-internals.ts"
import type { APIRoute, APIContext, AstroGlobal } from "astro"
import type { infer as ZodInfer, ZodTypeAny } from "zod"

let zod: typeof import("zod") | undefined
try { zod = await import("zod") } catch {}

export interface TypedAPIContext extends APIContext, Pick<AstroGlobal, "response"> {}

export interface TypedAPIHandler<Input, Output> {
    fetch(input: Input, context: TypedAPIContext): Promise<Output> | Output
}

export interface ZodAPIHandler<Schema extends ZodTypeAny, Output> extends TypedAPIHandler<ZodInfer<Schema>, Output> {
    schema: Schema
}

// this particular overload has some song and dance to make sure type information does not get lost somewhere, be careful when changing it
export function defineApiRoute<Schema extends ZodTypeAny, Handler extends ZodAPIHandler<Schema, unknown>>(handler: Handler & ZodAPIHandler<Schema, unknown>): APIRoute & Handler
export function defineApiRoute<Handler extends TypedAPIHandler<unknown, unknown>>(handler: Handler): APIRoute & Handler
export function defineApiRoute<SimpleRoute extends APIRoute>(handler: SimpleRoute): SimpleRoute
export function defineApiRoute(handler: any) {
    if ("schema" in handler && "fetch" in handler) {
        if (zod === undefined) {
            throw new ZodNotInstalled
        }
        const { schema, fetch } = handler
        if (schema instanceof zod.ZodType === false) {
            throw new InvalidSchema(schema)
        }
        function schemaValidatedFetch(input: any, context: TypedAPIContext) {
            try { input = schema.parse(input) }
            catch (error) { throw new ValidationFailed(error, context.request.url) }
            return fetch(input, context)
        }
        return Object.assign(createApiRoute(schemaValidatedFetch), handler)
    }
    if ("fetch" in handler) {
        return Object.assign(createApiRoute(handler.fetch), handler)
    }
    return handler
}
