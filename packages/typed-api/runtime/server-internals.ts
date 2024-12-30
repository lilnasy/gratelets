import type { APIContext, APIRoute } from "astro"
import { TypedAPIError } from "./errors.ts"
import {
    AcceptHeaderMissing,
    UnsupportedClient,
    UnknownRequestFormat,
    InputNotDeserializable,
    ProcedureFailed,
    ProcedureNotImplemented,
    OutputNotSerializable,
    ZodNotInstalled,
    InvalidSchema,
    ValidationFailed,
} from "./errors.server.ts"
import { stringify, parse } from "devalue"
import type { TypedAPIContext, TypedAPIHandler } from "./server.ts"

export function createApiRoute(handler: TypedAPIHandler<any, any>): APIRoute {
    return async function (ctx) {
        const { request, url: { pathname, searchParams } } = ctx
        const { headers } = request
        const contentType = headers.get("Content-Type")
        const accept = headers.get("Accept")
        if (accept === null) {
            throw new AcceptHeaderMissing(request)
        }

        const acceptsDevalue = accept.includes("application/devalue")
        const acceptsJson = accept.includes("application/json")
        const acceptsEventStream = accept.includes("text/event-stream")
        
        if (
            acceptsDevalue === false &&
            acceptsJson === false && 
            acceptsEventStream === false
        ) {
            throw new UnsupportedClient(request)
        }

        let input: any
        if (
            contentType === "application/json-urlencoded" ||
            (import.meta.env.TYPED_API_SERIALIZATION !== "devalue" && acceptsEventStream)
        ) {
            input = searchParams.get("input")
            if (input) try {
                input = JSON.parse(input)
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (
            contentType === "application/devalue-urlencoded" ||
            (import.meta.env.TYPED_API_SERIALIZATION === "devalue" && acceptsEventStream)
        ) {
            input = searchParams.get("input")
            if (input) try {
                input = parse(input)
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType === "application/json") {
            try {
                input = await request.json()
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType === "application/devalue") {
            try {
                input = parse(await request.text())
            } catch (error) {
                throw new InputNotDeserializable(error, pathname)
            }
        } else if (contentType !== null) {
            throw new UnknownRequestFormat(request)
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

        const context: TypedAPIContext = Object.assign(ctx, { response })

        let output: any
        try {
            if (acceptsEventStream && "subscribe" in handler && handler.subscribe) {
                const iterator = await handler.subscribe(input, context)
                const stream = new ReadableStream({
                    async pull(controller) {
                        const { value, done } = await iterator.next()
                        if (done) {
                            controller.enqueue("event:close\ndata:\n\n")
                            controller.close()
                        } else {
                            controller.enqueue(`data:${
                                import.meta.env.TYPED_API_SERIALIZATION === "devalue"
                                    ? stringify(value)
                                    : JSON.stringify(value)
                            }\n\n`)
                        }
                    },
                    async cancel() {
                        await iterator.return?.()
                    }
                })
                response.headers.set("Content-Type", "text/event-stream")
                return new Response(stream, response)
            } else if ("fetch" in handler && handler.fetch) {
                output = await handler.fetch(input, context)
            } else {
                throw new ProcedureNotImplemented(pathname, acceptsEventStream)
            }
        } catch (error) {
            if (error instanceof TypedAPIError) throw error
            const procedureFailed = new ProcedureFailed(error, pathname)
            if (import.meta.env.DEV) {
                // some errors are thrown intentionally
                // until a full error handling api is implemented, manually return 500 responses
                // to avoid dev overlay taking over the browser
                console.error(procedureFailed)
                return new Response(null, { status: 500 })
            }
            else {
                throw procedureFailed
            }
        }

        let outputBody: string | undefined = undefined
        if (acceptsDevalue) {
            try {
                outputBody = stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, pathname)
            }
            response.headers.set("Content-Type", "application/devalue")
        } else if (acceptsJson) {
            try {
                outputBody = JSON.stringify(output)
            } catch (error) {
                throw new OutputNotSerializable(error, pathname)
            }
            response.headers.set("Content-Type", "application/json")
        }
        
        return new Response(outputBody, response)
    }
}

async function validateInput(input: unknown, schema: unknown, pathname: string) {
    let zod: typeof import("zod") | undefined
    try {
        zod = await import("zod")
    } catch {
        throw new ZodNotInstalled
    }
    if (schema instanceof zod.ZodType === false) {
        throw new InvalidSchema(schema)
    }
    try {
        return schema.parse(input)
    } catch (error) {
        throw new ValidationFailed(error, pathname, input)
    }
}
