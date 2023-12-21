import { defineApiRoute } from "astro-typed-api/server"
import { z } from "zod"

/**
 * API Route in /src/pages/api/validatedInput.ts
 */
export const GET = defineApiRoute({
    schema: z.object({ x: z.number() }),
    fetch(input) {
        return { y: input.x * 2 }
    }
})
