import { TypedAPIError } from "./errors.ts"

export class CustomError<Type extends string> extends Error {
    name = "TypedAPI.CustomError" as const
    constructor(readonly type: Type, message?: string) {
        if (message) {
            super(message)
        } else {
            super()
        }
    }
}

export class InvalidUsage extends TypedAPIError<undefined> {
    name = "TypedAPI.InvalidUsageError" as const
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

export class NetworkError extends TypedAPIError<Error> {
    name = "TypedAPI.NetworkError" as const
    constructor(readonly error: Error) {
        super(error, "There was a network failure when requesting data from the server. Is the device connected to the internet?")
    }
}

export class UnusableResponse extends TypedAPIError<Response> {
    name = "TypedAPI.UnusableResponseError" as const
    constructor(readonly reason: "not ok" | "unknown format", response: Response) {
        const message =
            reason === "not ok" ? `The API call was unsuccessful: ${response.statusText ?? response.status}.` :
            reason === "unknown format" ? `The API call to ${response.url} was successful with a status code of ${response.status}, but the server responded with an unexpected format: ${response.headers.get("Content-Type")}.`
            : ""
        super(
            response,
            message,
            "See `error.cause` for the full response.",
        )
    }
}
