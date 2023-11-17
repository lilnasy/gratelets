import type { AstroIntegration } from "astro"

interface Options {}

export default function (options?: Options): AstroIntegration {
    return {
        name: "adds-to-head",
        hooks: {
            "astro:config:setup" ({ logger, config, updateConfig }) {}
        }
    } satisfies AstroIntegration
}
