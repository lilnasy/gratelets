import { TypedAPIError } from "./errors.ts"

export class ResponseNotAcceptable extends TypedAPIError<Response> {
    name = "TypedAPIError.ResponseNotAcceptable" as const
    constructor(readonly type: "not ok" | "unknown format", response: Response) {
        const message =
            type === "not ok" ? `The API call was unsuccessful: ${response.statusText ?? response.status}.` :
            type === "unknown format" ? `The API call to ${response.url} was successful with a status code of ${response.status}, but the server responded with an unexpected format: ${response.headers.get("Content-Type")}.`
            : ""
        super(
            response,
            message,
            "See `error.cause` for the full response.",
        )
    }
}

export class InvalidUsage extends TypedAPIError<undefined> {
    name = "TypedAPIError.InvalidUsage" as const
    constructor(type: "incorrect call", callType: string)
    constructor(type: "missing method", endpoint: string)
    constructor(type: "invalid method", endpoint: string, method: string)
    constructor(readonly type: "incorrect call" | "missing method" | "invalid method", arg_1: string, arg_2?: string) {
        const message =
            type === "incorrect call" ? `The client-side 'api' object must only be called with either the '.fetch()' or the '.subscribe()' method. It was called with '${arg_1}' instead.` :
            type === "missing method" ? `Request to endpoint "${arg_1}" cannot be made because the method is missing.\n\nWhen targetting the 'ALL' API Route handler, the method must be provided in options.` :
            type === "invalid method" ? `Request to endpoint "${arg_1}" cannot be made because the method ("${arg_2}") is invalid.\n\nThe method must be uppercase.'` : ""
        super(undefined, message)
    }
}

const x = new InvalidUsage("incorrect call", "fetch")
x.type
