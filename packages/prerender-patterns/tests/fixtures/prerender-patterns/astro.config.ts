import { defineConfig } from "astro/config"
import prerenderPatterns, { prerender, renderOnDemand } from "../../../integration.ts"
import { testAdapter } from "../../utils.ts"


export default defineConfig({
    output: "hybrid",
	adapter: testAdapter(),
    /* uncomment to test manually */
	// integrations: [
	// 	prerenderPatterns((path) => {
    //         console.log(path)
    //         if (path === "src/pages/page-default.astro") return renderOnDemand
    //     })
	// ]
})
