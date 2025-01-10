/**
 * This is not a subclass of Error. It is only used as a
 * brand check for the error created by
 * TypedAPIContext.error().
 * 
 * The native Error exists to inform the developer of the
 * implementation details that resulted in a failure, so
 * they can determine what went wrong.
 * 
 * Errors defined by the website author defined errors, on
 * the other hand, are a different category. They are part
 * of the application's normal behavior, not something to
 * be fixed or reported (until the rate of errors is
 * elevated).
 * 
 * Additionally, including the stack trace can be harmful.
 * It may make a malicious user privy to implementation
 * details.
 */
export class CustomError<Code extends String> {
    constructor(
        readonly code: Code,
        readonly message: string,
    ) {}
}
