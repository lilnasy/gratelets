import { defineConfig } from 'astro/config';
import scope from "astro-scope"

// https://astro.build/config
export default defineConfig({
    integrations: [scope()]
});
