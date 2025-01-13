export interface ErrorDetails<Reason extends string> {
    reason: Reason
    message?: string
}

export class ErrorResponse<Reason extends string> extends Response {
    constructor(details: Reason | ErrorDetails<Reason>, init?: ResponseInit) {
        const headers = new Headers(init?.headers)
        /**
         * Details of the custom error are stored in the headers
         * because astro has a spaghetti code handling of error
         * code responses, and the response body may be thrown
         * away every new moon.
         */
        if (typeof details === "string") {
            headers.set("X-Typed-Error", details)
        } else {
            headers.set("X-Typed-Error", details.reason)
        }
        if (typeof details === "object" && "message" in details && typeof details.message === "string") {
            headers.set("X-Typed-Message", details.message)
        }
        super(null, { status: init?.status ?? 500, headers })
    }
}
