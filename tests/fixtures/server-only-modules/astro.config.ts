import { defineConfig } from "astro/config"
import serverOnlyModules from "astro-server-only-modules"

// https://astro.build/config
export default defineConfig({
    integrations: process.env.INCLUDE === "true" ? [serverOnlyModules()] : [],
});
