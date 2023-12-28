import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch(message: string) {
        return message.split('').reverse().join('')
    }
})

export const POST = defineApiRoute({
    fetch(message: string) {
        return "from POST handler: " + message.split('').reverse().join('')
    }
})

export const ALL = defineApiRoute({
    fetch(message: string, { request }) {
        return `from ALL handler: ` + request.method + message.split('').reverse().join('')
    }
})
