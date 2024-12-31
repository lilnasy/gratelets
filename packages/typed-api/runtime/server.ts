import { createApiRoute } from "./server-internals.ts"
import type { APIRoute, APIContext, AstroGlobal } from "astro"
import type { infer as ZodInfer, ZodTypeAny } from "zod"

export interface TypedAPIContext extends APIContext, Pick<AstroGlobal, "response"> {}

export interface TypedAPIHandler<Input, Output> {
    fetch?(input: Input, context: TypedAPIContext):
        | Promise<Output>
        | Output

    subscribe?(input: Input, context: TypedAPIContext):
        | Promise<Iterator<Output>
        | AsyncIterator<Output>>
        | Iterator<Output>
        | AsyncIterator<Output>
}

export interface ZodAPIHandler<Schema extends ZodTypeAny, Output> extends TypedAPIHandler<ZodInfer<Schema>, Output> {
    schema: Schema
}

export const defineEndpoint = defineApiRoute

// this particular overload has some song and dance to make sure type information does not get lost somewhere, be careful when changing it
export function defineApiRoute<Schema extends ZodTypeAny, Handler extends ZodAPIHandler<Schema, unknown>>(handler: Handler & ZodAPIHandler<Schema, unknown>): APIRoute & Handler
export function defineApiRoute<Handler extends TypedAPIHandler<unknown, unknown>>(handler: Handler): APIRoute & Handler
export function defineApiRoute<SimpleRoute extends APIRoute>(handler: SimpleRoute): SimpleRoute
export function defineApiRoute(handler: any) {
    if ("fetch" in handler || "subscribe" in handler) {
        return Object.assign(createApiRoute(handler), handler)
    } else {
        return handler
    }
}
