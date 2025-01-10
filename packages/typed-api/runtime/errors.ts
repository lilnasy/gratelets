export class TypedAPIError<Cause = unknown> extends Error {
    name = "TypedAPIError"
    constructor(readonly cause: Cause, ...messages: string[]) {
        super(messages.join("\n\n"), { cause })
    }
}
