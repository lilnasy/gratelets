import { createApiRoute } from "./server-internals.ts"
import type { APIRoute, APIContext, AstroGlobal } from "astro"
import type * as z from "zod"

export interface TypedAPIContext extends APIContext, Pick<AstroGlobal, "response"> {}

export interface TypedHandler<Input, Output> {
    fetch(input: Input, context: TypedAPIContext): Promise<Output> | Output
}

export interface ZodHandler<Schema extends z.ZodTypeAny, Output> extends TypedHandler<z.infer<Schema>, Output> {
    schema: Schema
}

type Prettify<T> = { [K in keyof T]: T[K] } & {}

export function defineApiRoute<Schema extends z.ZodTypeAny, Handler extends ZodHandler<Schema, unknown>>(handler: Handler & ZodHandler<Schema, unknown>): APIRoute & Prettify<Pick<Handler, "fetch">>
export function defineApiRoute<Handler extends TypedHandler<unknown, unknown>>(handler: Handler): APIRoute & Pick<Handler, "fetch">
export function defineApiRoute<Handler extends APIRoute>(handler: Handler): Handler
export function defineApiRoute(handler: any) {
    if ("fetch" in handler === false) return handler
    return Object.assign(createApiRoute(handler), { fetch: handler.fetch })
}
