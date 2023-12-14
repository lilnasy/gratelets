import { defineApiRoute } from "astro-typed-api/server"

export const POST = defineApiRoute({
    fetch(input: { x: string }, context) {
        return { y: input.x + "xyz" }
    }
})
