import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(input: { x: string }, context) {
        return { y: input.x + "xyz" }
    }
})
