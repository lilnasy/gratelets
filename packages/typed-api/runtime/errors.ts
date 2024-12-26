export class TypedAPIError<Cause = unknown> extends Error {
    name = "TypedAPIError"
    cause: Cause
    constructor(cause: Cause, ...messages: string[]) {
        super(messages.join("\n\n"), { cause })
        this.cause = cause
    }
}
