import type { APIContext, APIRoute } from "astro"
import { TypedAPIError } from "./errors.ts"
import {
    UnusableRequest,
    ProcedureFailed,
    OutputNotSerializable,
    InvalidUsage,
    ValidationFailed,
} from "./errors.server.ts"
import { ErrorResponse } from "./error-response.ts"
import { stringify, parse } from "devalue"
import type { TypedAPIContext, TypedAPIHandler } from "./server.ts"
import type { ZodTypeAny } from "astro:schema"

export function createApiRoute(handler: TypedAPIHandler<any, any>): APIRoute {
    return async function (ctx) {
        const { request, url: { pathname, searchParams } } = ctx
        const { headers } = request
        const contentType = headers.get("Content-Type")
        const accept = headers.get("Accept")
        if (accept === null) {
            throw new UnusableRequest("accept header missing", request)
        }

        const acceptsDevalue = accept.includes("application/devalue+json")
        const acceptsJson = accept.includes("application/json")

        if (
            acceptsDevalue === false &&
            acceptsJson === false
        ) {
            throw new UnusableRequest("unsupported accept header", request)
        }

        let input: any
        if (
            contentType === "application/json-urlencoded" &&
            (import.meta.env.TYPED_API_SERIALIZATION !== "devalue")
        ) {
            input = searchParams.get("input")
            if (input) try {
                input = JSON.parse(input)
            } catch (error) {
                throw new UnusableRequest("deserialization failed", request, error as Error)
            }
        } else if (
            contentType === "application/devalue-urlencoded" &&
            (import.meta.env.TYPED_API_SERIALIZATION === "devalue")
        ) {
            input = searchParams.get("input")
            if (input) try {
                input = parse(input)
            } catch (error) {
                throw new UnusableRequest("deserialization failed", request, error as Error)
            }
        } else if (contentType === "application/json") {
            try {
                input = await request.json()
            } catch (error) {
                throw new UnusableRequest("deserialization failed", request, error as Error)
            }
        } else if (contentType === "application/devalue+json") {
            try {
                input = parse(await request.text())
            } catch (error) {
                throw new UnusableRequest("deserialization failed", request, error as Error)
            }
        } else if (contentType !== null) {
            throw new UnusableRequest("unsupported content type", request)
        }

        if ("schema" in handler && handler.schema) {
            input = await validateInput(input, handler.schema, pathname)
        }

        const response = {
            status: 200,
            statusText: "OK",
            headers: new Headers
        }

        Object.defineProperty(response, "headers", {
            value: response.headers,
            enumerable: true,
            writable: false
        })

        const context: TypedAPIContext = Object.assign(ctx, {
            response,
            error(details, response) {
                return new ErrorResponse(details, response)
            }
        } satisfies Omit<TypedAPIContext, keyof APIContext>)

        let output: any
        try {
            output = await handler.fetch(input, context)
        } catch (error) {
            if (error instanceof TypedAPIError) throw error
            throw new ProcedureFailed(error, pathname)
        }

        if (typeof output === "object" && output !== null && output instanceof ErrorResponse) {
            return output
        }

        let outputBody: string | undefined = undefined
        if (acceptsDevalue) {
            try {
                outputBody = stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, pathname)
            }
            response.headers.set("Content-Type", "application/devalue+json")
        } else if (acceptsJson) {
            try {
                outputBody = JSON.stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, pathname)
            }
            response.headers.set("Content-Type", "application/json")
        }

        /**
         * statusText is intentionally ignored. It is not part
         * of HTTP/2 and HTTP/3. It will work in development,
         * but not in production.
         */
        return new Response(outputBody, { status: response.status, headers: response.headers })
    }
}

async function validateInput(input: unknown, schema: unknown, pathname: string) {
    if (
        typeof schema !== "object" ||
        schema === null ||
        "safeParse" in schema === false ||
        typeof schema.safeParse !== "function"
    ) {
        throw new InvalidUsage("invalid schema", schema)
    }
    const { success, data, error } = (schema as ZodTypeAny).safeParse(input)
    if (success === false) {
        throw new ValidationFailed(error, pathname, input)
    }
    return data
}
