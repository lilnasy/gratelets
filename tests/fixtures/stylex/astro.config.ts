import { defineConfig } from "astro/config"
import stylex from "astro-stylex"
import react from "@astrojs/react"
import solid from "@astrojs/solid-js"

// https://astro.build/config
export default defineConfig({
    integrations: [stylex(), react({ include: "**/react.tsx" }), solid({ include: "**/solid.tsx" })]
})
