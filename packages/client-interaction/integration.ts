import { type AstroIntegration } from "astro"

declare module "astro" {
    interface AstroClientDirectives {
        "client:interaction"?: boolean
    }
}

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
