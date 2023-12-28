import { defineConfig } from "astro/config"
import stylex from "astro-stylex"
import react from "@astrojs/react"
import solid from "@astrojs/solid-js"
import preact from "@astrojs/preact"
import svelte from "@astrojs/svelte"

// https://astro.build/config
export default defineConfig({
    integrations: [
        stylex(),
        svelte(),
        preact({ include: "**/preact.tsx" }),
        react({ include: "**/react.tsx" }),
        solid({ include: "**/solid.tsx" }),
    ]
})
