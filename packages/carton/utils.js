const index = import.meta.resolve("astro")

/** @type {import("./node_modules/astro/dist/core/render/core.js")} */
export const { renderPage } = await import(new URL("./render/core.js", index))
/** @type {import("./node_modules/astro/dist/core/cookies/cookies.js")} */
export const { AstroCookies } = await import(new URL("./cookies/cookies.js", index))
/** @type {import("./node_modules/astro/dist/core/logger/core.js")} */
export const { Logger } = await import(new URL("./logger/core.js", index))
/** @type {import("./node_modules/astro/dist/core/logger/console.js")} */
export const { consoleLogDestination } = await import(new URL("./logger/console.js", index))
/** @type {import("./node_modules/astro/dist/core/render/route-cache.js")} */
export const { RouteCache } = await import(new URL("./render/route-cache.js", index))
/** @type {import("./node_modules/astro/dist/core/render/index.js")} */
export const { createEnvironment, createRenderContext } = await import(new URL("./render/index.js", index))
