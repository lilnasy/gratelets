import { defineApiRoute } from "astro-typed-api/server"
import z from "zod"

export const POST = defineApiRoute({
    schema: z.object({ x: z.string(), y: z.number() }),
    fetch({ x, y }, { locals, cookies }) {
        return { z: x + "xyz" + y }
    }
})
