import { createApiRoute } from "./server-internals.ts"
import type { APIRoute, APIContext } from "astro"
import type { infer as ZodInfer, ZodTypeAny } from "zod"
import type { ErrorDetails, ErrorResponse } from "./error-response.ts"

export interface TypedAPIContext extends APIContext {
    response: ResponseInit
    error<Type extends string>(
        details: ErrorDetails<Type>,
        response?: ResponseInit
    ): ErrorResponse<Type>
}

export interface TypedAPIHandler<Input, Output> {
    fetch(input: Input, context: TypedAPIContext): Promise<Output> | Output
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
    if ("fetch" in handler) {
        return Object.assign(createApiRoute(handler), handler)
    } else {
        return handler
    }
}
