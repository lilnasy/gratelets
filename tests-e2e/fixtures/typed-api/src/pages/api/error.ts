import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(message: string, { error }) {
        return error({ type: "error_code_500" })
    }
})
