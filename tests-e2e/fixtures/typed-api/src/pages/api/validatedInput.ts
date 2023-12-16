import { defineApiRoute } from "astro-typed-api/server"
import { z } from "zod"

/**
 * endpoint description
 */
export const GET = defineApiRoute({
    schema: z.object({ x: z.number() }),
    fetch(input) {
        return { y: input.x * 2 }
    }
})
