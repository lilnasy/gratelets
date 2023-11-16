import { defineConfig } from "astro/config"
import prerenderPatterns from "../../../integration.ts"
import { testAdapter } from "../../utils.ts"


export default defineConfig({
    output: "hybrid",
	adapter: testAdapter(),
    /* uncomment to test manually */
	// integrations: [
	// 	prerenderPatterns((path, currentDecision) => {
    //         console.log(path, currentDecision)
    //         if (path === "src/pages/page-default.astro") return "prerender"
    //     })
	// ],
})
