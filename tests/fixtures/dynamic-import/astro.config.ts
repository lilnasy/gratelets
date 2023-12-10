import { defineConfig } from "astro/config"
import dynamicImport from "astro-dynamic-import"

// https://astro.build/config
export default defineConfig({
    integrations: [dynamicImport()]
})
