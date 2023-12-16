export class TypedAPIError extends Error {
    name = "TypedAPIError"
    constructor(cause: unknown, ...messages: string[]) {
        super(messages.join("\n"), { cause })
    }
}

export class IncorrectHTTPVerb extends TypedAPIError {
    name = "TypedAPIError.IncorrectHTTPVerb"
    constructor(verb: string, path: string) {
        super(
            null,
            `Request to path ${path} cannot be made because the method (${verb}) is not valid.`,
            "The method must be uppercase and directly precede fetch()."
        )
    }
}

export class ResponseNotOK extends TypedAPIError {
    name = "TypedAPIError.ResponseNotOK"
    constructor(response: Response) {
        super(
            response,
            `The API call was unsuccessful: ${response.statusText ?? response.status}.`,
            "See `error.cause` for the full response.",
        )
    }
}

export class UnknownFormat extends TypedAPIError {
    name = "TypedAPIError.UnknownFormat"
    constructor(pathname: string, contentType: string | null, response: Response) {
        super(
            response,
            `The API call to ${pathname} was successfull, but the response was in an unexpected format: ${contentType}.`,
            "See `error.cause` for the full response.",
        )
    }
}

export class ZodNotInstalled extends TypedAPIError {
    name = "TypedAPIError.ZodNotInstalled"
    constructor() {
        super(
            null,
            "API Route defines a schema, but zod is not installed.",
            "Schema validation is an optional feature that requires zod to be installed in your project",
            "Please try again after running `npm install zod`."
        )
    }
}

export class InvalidSchema extends TypedAPIError {
    name = "TypedAPIError.InvalidSchema"
    constructor() {
        super(
            null,
            "API Route defines a schema, but the schema is not a valid zod schema.",
            "The schema must be an instance of ZodType."
        )
    }
}

export class ValidationFailed extends TypedAPIError {
    name = "TypedAPIError.ValidationFailed"
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

export class InputNotDeserializable extends TypedAPIError {
    name = "TypedAPIError.InputNotDeserializable"
    constructor(cause: unknown, url: string) {
        super(
            cause,
            `The API Route failed to process the  request for ${url}.`,
            "The input for the fetch handler could not be deserialized from the request.",
            String(cause),
            "See `error.cause` for more details."
        )
    }
}

export class ProcedureFailed extends TypedAPIError {
    name = "TypedAPIError.ProcedureFailed"
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
    name = "TypedAPIError.OutputNotSerializable"
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
