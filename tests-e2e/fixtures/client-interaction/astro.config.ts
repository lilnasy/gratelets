import { defineConfig } from "astro/config"
import preact from "@astrojs/preact"
import clientIx from "astro-client-interaction"

// https://astro.build/config
export default defineConfig({
	integrations: [preact(), clientIx()],
})
