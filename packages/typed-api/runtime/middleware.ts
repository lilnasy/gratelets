import type { MiddlewareNext } from "astro"
import { AcceptHeaderMissing, InputNotDeserializable, ProcedureFailed, UnknownRequestFormat, UnsupportedClient, ValidationFailed } from "./errors.server.ts"

/**
 * This middleware handles errors that occured due to malformed
 * requests and returns an appropriate error response.
 */
export async function onRequest(_: unknown, next: MiddlewareNext) {
    try {
        return await next()
    } catch (error) {
        if (
            error instanceof AcceptHeaderMissing ||
            error instanceof InputNotDeserializable ||
            error instanceof UnknownRequestFormat ||
            error instanceof UnsupportedClient ||
            error instanceof ValidationFailed
        ) {
            console.error(error)
            return new Response("Bad Request", { status: 400 })
        }
        // avoid the dev error overlay taking over the browser
        if (import.meta.env.DEV && error instanceof ProcedureFailed) {
            console.error(error)
            return new Response("Internal Server Error", { status: 500 })
        }
        throw error
    }
}
