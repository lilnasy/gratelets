import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(message: string, { error }) {
        return error({ code: "error_code_500", message: "this is an error" })
    }
})
