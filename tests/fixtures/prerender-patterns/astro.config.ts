import { defineConfig } from "astro/config"
import prerenderPatterns, { prerender, renderOnDemand } from "astro-prerender-patterns"
import { testAdapter } from "../../utils.ts"

// https://astro.build/config
export default defineConfig({
    output: "static",
	adapter: testAdapter,
    /* uncomment to test manually */
	// integrations: [
	// 	prerenderPatterns((path) => {
    //         console.log(path)
    //         if (path === "src/pages/page-default.astro") return renderOnDemand
    //     })
	// ]
})
