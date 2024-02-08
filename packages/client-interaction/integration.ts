import { type AstroIntegration } from "astro"

declare module "astro" {
    interface AstroClientDirectives {
        /**
         * The `client:interaction` directive allows you to delay the hydration of a component until the user interacts with the page.
         * 
         * ```jsx
         * <Component client:interaction />
         * ```
         * 
         * Interactions may happen while the page is still loading.
         * Setting the value of the directive to "idle" allows to defer loading until the browser is also idle.
         * 
         * ```jsx
         * <Component client:interaction="idle" />
         * ```
         */
        "client:interaction"?: boolean | "idle"
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
