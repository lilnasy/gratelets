import { fileURLToPath } from "node:url"
import { readFileSync } from "node:fs"
import * as Astro from "astro"

export async function dev(relativeRootPath: `./fixtures/${string}`, options?: Astro.AstroInlineConfig) {
    return command("dev", relativeRootPath, options)
}

export function build(relativeRootPath: `./fixtures/${string}`, options?: Astro.AstroInlineConfig) {
    return command("build", relativeRootPath, options)
}

async function command<Command extends "dev" | "build">(
    command: Command,
    relativeRootPath: string,
    options?: Astro.AstroInlineConfig
) {
    const root = resolve(relativeRootPath)
    return await Astro[command]({
        root,
        logLevel: "silent",
        ...options,
        vite: { logLevel: "silent", ...options?.vite },
    }) as Command extends "dev" ? ReturnType<typeof Astro.dev> : void
}

function resolve(relativePath: string) {
    return fileURLToPath(new URL(relativePath, import.meta.url))
}

export function readTextFile(path: string): string {
    return readFileSync(resolve(path), "utf8").toString()
}
