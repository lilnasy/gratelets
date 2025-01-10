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
            "The input for the fetch handler failed to validate against the schema.",
            `Zod error: ${cause}`,
            "See `error.cause` for the error provided by zod."
        )
    }
}

export class AcceptHeaderMissing extends TypedAPIError<Request> {
    name = "TypedAPI.AcceptHeaderMissing" as const
    constructor(request: Request) {
        super(
            request,
            `The API call to ${request.url} was invalid.`,
            "The request must include an `Accept` header.",
            "See `error.cause` for the full request."
        )
    }
}

export class UnsupportedClient extends TypedAPIError<Request> {
    name = "TypedAPI.UnsupportedClient" as const
    constructor(request: Request) {
        super(
            request,
            `The API request to ${request.url} was made by an unsupported client.`,
            "The request's `Accept` header must include either `application/json` or `application/escodec`.",
            `${JSON.stringify(request.headers.get("Accept"))} included neither.`,
            "See `error.cause` for the full request."
        )
    }
}

export class UnknownRequestFormat extends TypedAPIError<Request> {
    name = "TypedAPI.UnknownRequestFormat" as const
    constructor(request: Request) {
        super(
            request,
            `The API request to ${request.url} was invalid.`,
            "Request format was neither JSON nor es-codec.",
            "`Content-Type` header must be either `application/json` or `application/escodec`.",
            `Instead, it was ${JSON.stringify(request.headers.get("Content-Type"))}.`,
            "See `error.cause` for the full request."
        )
    }
}

export class InputNotDeserializable extends TypedAPIError {
    name = "TypedAPI.InputNotDeserializableError" as const
    constructor(cause: unknown, url: string) {
        super(
            cause,
            `The API Route failed to process the  request for ${url}.`,
            "The input for the fetch handler could not be parsed from the request.",
            String(cause),
            "See `error.cause` for more details."
        )
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
