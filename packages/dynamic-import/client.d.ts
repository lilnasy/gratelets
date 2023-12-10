type AstroComponentFactory = import("astro/runtime/server/index.js").AstroComponentFactory

declare module "astro:import" {
    export default function (specifier: string): Promise<AstroComponentFactory>
}
