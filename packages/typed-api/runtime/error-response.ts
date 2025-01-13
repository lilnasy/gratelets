export interface ErrorDetails<Reason extends string> {
    reason: Reason
    message?: string
}

export interface ResponseOptions {
    status?: number
    headers?: HeadersInit
}

export class ErrorResponse<Reason extends string> extends Response {
    constructor(details: Reason | ErrorDetails<Reason>, response?: ResponseOptions) {
        const status = 
            // prevent ok response status on error responses
            response?.status && response.status >= 400
                ? response.status
                : 500

        const headers = new Headers(response?.headers)
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
        super(null, { status: response?.status ?? 500, headers })
    }
}
