import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(message: string) {
        return message.split('').reverse().join('')
    }
})
