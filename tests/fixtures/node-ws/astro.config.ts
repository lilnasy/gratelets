import { defineConfig } from "astro/config"
import nodeWs from "astro-node-ws"

// https://astro.build/config
export default defineConfig({
    adapter: nodeWs({ mode: "standalone" })
})
