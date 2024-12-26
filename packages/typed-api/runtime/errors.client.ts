import { TypedAPIError } from "./errors.ts"

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
            `The API call to ${response.url} was successful, but the server responded with an unexpected format: ${response.headers.get("Content-Type")}.`,
            "See `error.cause` for the full response.",
        )
    }
}
