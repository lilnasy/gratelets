import { defineEndpoint } from "astro-typed-api/server"

export const GET = defineEndpoint({
    *subscribe(message: string, ctx) {
        ctx.lastEventId
        const reply = "reply from subscription: " + message.split("").reverse().join("")
        for (const char of reply) {
            yield char
        }
    }
})
