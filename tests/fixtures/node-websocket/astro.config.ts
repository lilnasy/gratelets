import { defineConfig } from "astro/config"
import nodeWebSocket from "astro-node-websocket"

// https://astro.build/config
export default defineConfig({
    adapter: nodeWebSocket({ mode: "standalone" })
})
