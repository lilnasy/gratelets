import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(message: string) {
        return `${process.env.REVERSE_PREFIX}-${message.split('').reverse().join('')}`
    }
})
