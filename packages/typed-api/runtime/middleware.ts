import type { APIContext, MiddlewareNext } from "astro"
import { ProcedureFailed, UnusableRequest, ValidationFailed } from "./errors.server.ts"
import { apiContextStorage } from "./api-context-storage.ts"

/**
 * This middleware handles errors that occured due to malformed
 * requests and returns an appropriate error response.
 */
export async function onRequest(context: APIContext, next: MiddlewareNext) {
    try {
        return await apiContextStorage.run(context, next)
    } catch (error) {
        if (
            error instanceof UnusableRequest ||
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
