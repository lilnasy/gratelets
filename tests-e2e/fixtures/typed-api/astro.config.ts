import { defineConfig } from "astro/config"
import node from "@astrojs/node"
import typedApi from "astro-typed-api"

export default defineConfig({
    output: "server",
    adapter: node({ mode: "standalone" }),
    integrations: [typedApi()]
})
