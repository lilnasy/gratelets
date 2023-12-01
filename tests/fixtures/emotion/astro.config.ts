import { defineConfig } from "astro/config"
import emotion from "astro-emotion"
import preact from "@astrojs/preact"
import svelte from "@astrojs/svelte"
import react from "@astrojs/react"
import solid from "@astrojs/solid-js"

// https://astro.build/config
export default defineConfig({
    integrations: [
        emotion(),
        svelte(),
        preact({ include: "**/preact.tsx" }),
        react({ include: "**/react.tsx" }),
        solid({ include: "**/solid.tsx" })
    ]
})
