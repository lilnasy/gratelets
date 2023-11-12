import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import * as Astro from 'astro'

function resolve(relativePath: string) {
    return fileURLToPath(new URL(relativePath, import.meta.url))
}

export async function build(relativeRootPath: `./fixtures/${string}`, options?: Astro.AstroInlineConfig) {
    const root = resolve(relativeRootPath)
    await Astro.build({
        root,
        logLevel: 'silent',
        ...options,
        vite: { logLevel: 'silent', ...options?.vite },
    })
}

export function readTextFile(path: string): string {
    return readFileSync(resolve(path), 'utf8').toString()
}
