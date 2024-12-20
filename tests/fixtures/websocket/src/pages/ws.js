export const prerender = false

/** @type {import("astro").APIRoute} */
export function GET(context) {
    const { headers } = context.request
    if (
        headers.get("upgrade") === "websocket" &&
        headers.get("sec-websocket-protocol") !== "unsupported-protocol"
    ) {
        const { response, socket } = context.locals.upgradeWebSocket()
        socket.onmessage = (/** @type {MessageEvent<string>} */ e) => socket.send([...e.data].reverse().join(""))
        return response
    }
    return new Response("Upgrade Required", {
        status: 426,
        headers: {
            "X-Error": "Non Upgrade Request"
        }
    })
}