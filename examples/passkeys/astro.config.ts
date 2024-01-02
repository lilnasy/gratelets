import { defineConfig } from "astro/config"
import node from "@astrojs/node"
import react from "@astrojs/react"
import typedApi from "astro-typed-api"

// https://astro.build/config
export default defineConfig({
    output: "server",
    integrations: [react(), typedApi()],
    adapter: node({ mode: "standalone" })
})
