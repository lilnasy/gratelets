import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import addsToHead from "../../../integration.ts"

export default defineConfig({
    integrations: [ mdx(), addsToHead() ]
})
