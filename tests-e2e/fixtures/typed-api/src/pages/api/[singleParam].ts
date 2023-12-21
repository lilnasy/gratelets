import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(_: {}, { params }) {
        return params
    }
})
