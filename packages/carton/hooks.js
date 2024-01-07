// @ts-check
import esbuild from "esbuild"
import { transform } from "@astrojs/compiler"

/** @type {import("node:module").InitializeHook} */
export async function initialize() {}

/** @type {import("node:module").ResolveHook} */
export async function resolve(specifier, context, next) {
    if (specifier.endsWith(".astro")) {
        const resolved = new URL(specifier, context.parentURL)
        return {
            format: "module",
            url: resolved.href,
            shortCircuit: true
        }
    }
    return next(specifier, context)
}

/** @type {import("node:module").LoadHook} */
export async function load(url, context, next) {
    if (!url.endsWith(".astro")) return next(url, context)
    const loadedFromDisk = await next(url, context)
    const { source: contents } = loadedFromDisk
    if (!contents) return loadedFromDisk

    /** @type {string} */
    let astroSource
    if (ArrayBuffer.isView(contents)) {
        astroSource = new TextDecoder().decode(contents)
    } else {
        // @ts-expect-error this is fine
        astroSource = contents
    }

    const { code: tsSource } = await transform(astroSource, {
        filename: url,
        normalizedFilename: url,
        sourcemap: 'inline',
        internalURL: 'astro/compiler-runtime',
        async resolvePath(path) { return path }
    })
    const { code: jsSource } = await esbuild.transform(tsSource, {
        loader: "ts",
        target: "esnext",
        tsconfigRaw: {
            compilerOptions: {
                // Ensure client:only imports are treeshaken
                verbatimModuleSyntax: false,
                importsNotUsedAsValues: "remove",
            }
        }
    })
    return {
        format: "module",
        source: jsSource,
        shortCircuit: true
    }
}
