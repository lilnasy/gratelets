import { TypedAPIError } from "./errors.ts"

export class InvalidSchema extends TypedAPIError<unknown> {
    name = "TypedAPI.InvalidSchema" as const
    constructor(invalidSchema: unknown) {
        super(
            invalidSchema,
            "API Route defines a schema, but the schema is not a valid zod schema.",
            "The schema must be an instance of ZodType."
        )
    }
}

export class ValidationFailed extends TypedAPIError {
    name = "TypedAPI.ValidationFailed" as const
    constructor(cause: unknown, url: string, readonly input: unknown) {
        super(
            cause,
            `The API Route failed to process the  request for ${url}.`,
            "The input parsed from the request failed to validate against the schema.",
            "See `error.cause` for the error provided by zod."
        )
    }
}

export class UnusableRequest<
    Type extends
        | "accept header missing"
        | "unsupported accept header"
        | "unsupported content type"
        | "deserialization failed",
> extends TypedAPIError<Request> {

    name = "TypedAPI.UnusableRequest" as const

    // @ts-expect-error
    deserializationError: Type extends "deserialization failed" ? Error : undefined = undefined

    constructor(type: "deserialization failed", request: Request, cause: Error)
    constructor(type: Exclude<Type, "deserialization failed">, request: Request)
    constructor(readonly type: Type, request: Request, arg_2?: Error) {
        if (type === "accept header missing") {
            super(
                request,
                `The API call to ${request.url} was invalid.`,
                "A request to a typed API route must have the `Accept` header.",
                `The received request only included the following headers: ${Array.from(request.headers.keys()).join(", ")}.`,
                "See `error.cause` for the full request."
            )
        } else if (type === "unsupported accept header") {
            super(
                request,
                `The API call to ${request.url} was invalid.`,
                "A request to a typed API route must have the `Accept` header, and it should include either `application/json` or `application/devalue`.",
                `The received request's \`Accept\` header value ("${JSON.stringify(request.headers.get("Accept"))}") included neither.`,
                "See `error.cause` for the full request."
            )
        } else if (type === "unsupported content type") {
            super(
                request,
                `The API request to ${request.url} was invalid.`,
                "A request to a typed API route must have the `Content-Type` header, and it must be either `application/json` or `application/devalue`.",
                `Instead, it was \`${JSON.stringify(request.headers.get("Content-Type"))}\`, which the route cannot decode.`,
                "See `error.cause` for the full request."
            )
        } else {
            super(
                request,
                `The API Route failed to process the  request for ${request.url}.`,
                `The ${request.headers.get("Content-Type") === "application/json" ? "JSON" : "devalue"}-encoded data sent by the client could not be decoded from the request.`,
                String(arg_2?.message),
                "See `error.deserializationError` for more details."
            )
            // @ts-expect-error
            this.deserializationError = arg_2
        }
    }
}

export class ProcedureFailed extends TypedAPIError {
    name = "TypedAPI.ProcedureFailedError" as const
    constructor(cause: unknown, url: string) {
        super(
            cause,
            `The API Route failed to process the request for ${url}.`,
            String(cause),
            "See `error.cause` for more details"
        )
    }
}

export class OutputNotSerializable extends TypedAPIError {
    name = "TypedAPI.OutputNotSerializableError" as const
    constructor(cause: unknown, url: string) {
        super(
            cause,
            `The API Route failed to process the  request for ${url}.`,
            "The output from fetch handler could not be serialized.",
            String(cause),
            "See `error.cause` for more details.",
        )
    }
}
