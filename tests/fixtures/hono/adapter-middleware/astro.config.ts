import { defineConfig } from "astro/config"
import hono from "astro-hono"

export default defineConfig({
    output: "server",
    adapter: hono()
})
