import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import addsToHead from "astro-adds-to-head"

export default defineConfig({
    integrations: [ mdx(), addsToHead() ]
})
