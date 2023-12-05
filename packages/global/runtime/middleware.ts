import storage from "./als.ts"
import type { APIContext, MiddlewareNext } from "astro"

export function onRequest(ctx: APIContext, next: MiddlewareNext) {
    return storage.run(ctx, next)
}
