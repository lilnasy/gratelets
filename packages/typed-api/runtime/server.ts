// @ts-nocheck
import { ZodNotInstalled, InvalidSchema, ValidationFailed } from "./error.ts"
import { createApiRoute } from "./server-internals.ts"
import type { APIRoute, APIContext, AstroGlobal } from "astro"

type ZodTypeAny = import("zod").ZodTypeAny
let zod: typeof import("zod") | undefined
try { zod = await import("zod") } catch {}

export interface TypedAPIContext extends APIContext, Pick<AstroGlobal, "response"> {}

export interface TypedHandler<Input, Output> {
    fetch(input: Input, context: TypedAPIContext): Promise<Output> | Output
}

export interface ZodHandler<Schema extends ZodTypeAny, Output> extends TypedHandler<import("zod").infer<Schema>, Output> {
    schema: Schema
}

// this particular overload has some song and dance to make sure type information does not get lost somewhere, be careful when changing it
export function defineApiRoute<Schema extends ZodTypeAny, Handler extends ZodHandler<Schema, unknown>>(handler: Handler & ZodHandler<Schema, unknown>): APIRoute & Handler
export function defineApiRoute<Handler extends TypedHandler<unknown, unknown>>(handler: Handler): APIRoute & Handler
export function defineApiRoute<SimpleRoute extends APIRoute>(handler: SimpleRoute): SimpleRoute
export function defineApiRoute(handler) {
    if ("schema" in handler && "fetch" in handler) {
        if (zod === undefined) throw new ZodNotInstalled
        const { schema, fetch } = handler
        if (schema instanceof zod.ZodType === false) throw new InvalidSchema
        function schemaValidatedFetch(input, context: TypedAPIContext) {
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
