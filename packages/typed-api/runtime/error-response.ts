export interface ErrorDetails<Type extends string> {
    type: Type
    message?: string
}

export class ErrorResponse<Type extends string> extends Response {
    constructor(details: { type: Type, message?: string }, init?: ResponseInit) {
        const headers = new Headers(init?.headers)
        /**
         * Details of the custom error are stored in the headers
         * because astro has a spaghetti code handling of error
         * code responses, and the response body may be thrown
         * away every new moon.
         */
        headers.set("X-Typed-Error", details.type)
        if (details.message) {
            headers.set("X-Typed-Message", details.message)
        }
        super(null, { status: init?.status ?? 500, headers })
    }
}
