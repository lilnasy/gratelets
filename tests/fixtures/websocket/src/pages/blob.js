export const prerender = false

/** @type {import("astro").APIRoute} */
export function GET(context) {
    const { response, socket } = context.locals.upgradeWebSocket()
    // this GET function is reused by pages/arraybuffer.js module
    // (it also handles the /arraybuffer route)
    const { pathname } = context.url
    if (pathname === "/arraybuffer") {
        socket.binaryType = "arraybuffer"
    }
    socket.onmessage = async (/** @type {MessageEvent<string | Blob | ArrayBuffer>} */ e) => {
        if (pathname === "/arraybuffer") {
            const text = new TextDecoder().decode(new Uint8Array(e.data))
            const reversed = text.split('').reverse().join('')
            socket.send(new TextEncoder().encode(reversed))
        } else if (pathname === "/blob") {
            const text = await e.data.text()
            const reversed = text.split('').reverse().join('')
            socket.send(new Blob([reversed]))
        } else {
            socket.send("unknown path")
        }
    }
    return response
}
