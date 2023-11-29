import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import preact from "@astrojs/preact"
import global from "astro-global"

// https://astro.build/config
export default defineConfig({
	integrations: [mdx(), preact(), global()],
})
