import type { AstroIntegration } from "astro"

interface Options {}

export default function (_: Partial<Options> = {}): AstroIntegration {
    return {
        name: "astro-client-interaction",
        hooks: {
            "astro:config:setup" ({ addClientDirective }) {
                addClientDirective({
                    name: "interaction",
                    entrypoint: "astro-client-interaction/runtime/directive.ts"
                })
            }
        }
    }
}
