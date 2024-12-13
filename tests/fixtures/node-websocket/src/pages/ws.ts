import type { APIContext } from "astro";

export const prerender = false

export function GET(context: APIContext) {
    const { headers } = context.request
    if (
        headers.get("upgrade") === "websocket" &&
        headers.get("sec-websocket-protocol") !== "unsupported-protocol"
    ) {
        const { response, socket } = context.locals.upgradeWebSocket()
        socket.onmessage = (e: MessageEvent<string>) => socket.send([...e.data].reverse ().join(""))
        return response
    }
    return new Response("Upgrade Required", {
        status: 426,
        headers: {
            "X-Error": "Non Upgrade Request"
        }
    })
}