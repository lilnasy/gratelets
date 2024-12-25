export class TypedAPIError<Cause = unknown> extends Error {
    name = "TypedAPIError"
    cause: Cause
    constructor(cause: Cause, ...messages: string[]) {
        super(messages.join("\n\n"), { cause })
        this.cause = cause
    }
}

export class MissingHTTPVerb extends TypedAPIError<undefined> {
    name = "TypedAPIError.MissingHTTPVerb" as const
    constructor(endpoint: string) {
        super(
            undefined,
            `Request to endpoint ${endpoint} cannot be made because the method is missing.`,
            "When targetting the 'ALL' API Route handler, the method must be provided in options."
        )
    }
}

export class IncorrectHTTPVerb extends TypedAPIError<undefined> {
    name = "TypedAPIError.IncorrectHTTPVerb" as const
    constructor(verb: string, endpoint: string) {
        super(
            undefined,
            `Request to endpoint ${endpoint} cannot be made because the method (${verb}) is not valid.`,
            "The method must be uppercase and directly precede fetch()."
        )
    }
}

export class ResponseNotOK extends TypedAPIError<Response> {
    name = "TypedAPIError.ResponseNotOK" as const
    constructor(response: Response) {
        super(
            response,
            `The API call was unsuccessful: ${response.statusText ?? response.status}.`,
            "See `error.cause` for the full response.",
        )
    }
}

export class UnknownResponseFormat extends TypedAPIError<Response> {
    name = "TypedAPIError.UnknownResponseFormat" as const
    constructor(response: Response) {
        super(
            response,
            `The API call to ${response.url} was successfull, but the server responded with an unexpected format: ${response.headers.get("Content-Type")}.`,
            "See `error.cause` for the full response.",
        )
    }
}

export class ZodNotInstalled extends TypedAPIError<undefined> {
    name = "TypedAPIError.ZodNotInstalled" as const
    constructor() {
        super(
            undefined,
            "API Route defines a schema, but zod is not installed.",
            "Schema validation is an optional feature that requires zod to be installed in your project",
            "Please try again after running `npm install zod`."
        )
    }
}

export class InvalidSchema extends TypedAPIError<unknown> {
    name = "TypedAPIError.InvalidSchema" as const
    constructor(invalidSchema: unknown) {
        super(
            invalidSchema,
            "API Route defines a schema, but the schema is not a valid zod schema.",
            "The schema must be an instance of ZodType."
        )
    }
}

export class ValidationFailed extends TypedAPIError {
    name = "TypedAPIError.ValidationFailed" as const
    constructor(cause: unknown, url: string) {
        super(
            cause,
            `The API Route failed to process the  request for ${url}.`,
            "The input for the fetch handler failed to validate against the schema.",
            String(cause),
            "See `error.cause` for more details."
        )
    }
}

export class AcceptHeaderMissing extends TypedAPIError<Request> {
    name = "TypedAPIError.AcceptHeaderMissing" as const
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
    name = "TypedAPIError.InputNotDeserializable" as const
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
    name = "TypedAPIError.ProcedureFailed" as const
    constructor(cause: unknown, url: string) {
        super(
            cause,
            `The API Route failed to process the  request for ${url}.`,
            String(cause),
            "See `error.cause` for more details"
        )
    }
}

export class OutputNotSerializable extends TypedAPIError {
    name = "TypedAPIError.OutputNotSerializable" as const
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
