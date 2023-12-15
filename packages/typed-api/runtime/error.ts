export class TypedAPIError extends Error {
    name = "TypedAPIError"
    constructor(message: string, cause?: any) {
        super(message, { cause })
    }
}
