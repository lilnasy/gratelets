import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(message: string, { error }) {
        return error("error_code_500")
    }
})
