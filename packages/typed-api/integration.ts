import fs from "node:fs"
import url from "node:url"
import path from "node:path"
import { globby } from "globby"
import type { AstroIntegration, AstroIntegrationLogger } from "astro"

export interface Options {}

export default function (_?: Partial<Options>): AstroIntegration {
    let apiDir: URL
    let declarationFileUrl: URL
    return {
        name: "astro-typed-api",
        hooks: {
            "astro:config:setup" ({ updateConfig, config, logger }) {
                apiDir = new URL("pages/api", config.srcDir)
                const dotAstroDir = new URL('.astro/', config.root)
                declarationFileUrl = new URL("./typed-api.d.ts", dotAstroDir)
                updateConfig({ vite: { plugins: [{
                    name: "astro-typed-api/typegen",
                    enforce: "post",
                    async config() {
                        const filenames = await globby("**/*.{ts,mts}", { cwd: apiDir })
                        injectTypesDTs(dotAstroDir, logger, declarationFileUrl)
                        generateTypes(filenames, apiDir, declarationFileUrl)
                    }
                }] } })
                updateConfig({
                    vite: {
                        define: {
                            "import.meta.env._TRAILING_SLASH": JSON.stringify(config.trailingSlash)
                        },
                        ssr: {
                            // this package is published as uncompiled typescript, which we need vite to process
                            noExternal: ["astro-typed-api"]
                        }
                    }
                })
            },
            "astro:server:setup" ({ server }) {
                server.watcher.on("add", async path => {
                    if (path.includes("pages/api") || path.includes("pages\\api")) {
                        const filenames = await globby("**/*.{ts,mts}", { cwd: apiDir })
                        generateTypes(filenames, apiDir, declarationFileUrl)
                    }
                })
            }
        }
    }
}

async function generateTypes(filenames: string[], apiDir: URL, declarationFileUrl: URL) {
    const dotAstroPath = path.dirname(url.fileURLToPath(declarationFileUrl))
    const apiPath = url.fileURLToPath(apiDir)
    fs.mkdirSync(path.dirname(url.fileURLToPath(declarationFileUrl)), { recursive: true })
    let declaration = ``
    declaration += `type CreateRouter<Routes> = import("astro-typed-api/types").CreateRouter<Routes>\n`
    declaration += `\n`
    declaration += `declare namespace TypedAPI {\n`
    declaration += `    interface Client extends CreateRouter<[\n`
    for (const filename of filenames) {
        const endpoint = filename.replace(/(\/index)?\.m?ts$/, "")
        const specifier = path.relative(dotAstroPath, path.join(apiPath, filename)).replaceAll("\\", "/")
        declaration += `    `
        declaration += `    [${JSON.stringify(endpoint)}, typeof import(${JSON.stringify(specifier)})],\n`
    }
    declaration += `    ]> {}\n`
    declaration += `}\n`
    fs.writeFileSync(declarationFileUrl, declaration)
}

function injectTypesDTs(dotAstroDir: URL, logger: AstroIntegrationLogger, specifier: URL | string) {
    const typesDTsPath = url.fileURLToPath(new URL("./types.d.ts", dotAstroDir))
    
    if (specifier instanceof URL) {
        specifier = url.fileURLToPath(specifier)
        specifier = path.relative(url.fileURLToPath(dotAstroDir), specifier)
        specifier = specifier.replaceAll("\\", "/")
    }
    
    let typesDTsContents = fs.readFileSync(typesDTsPath, "utf8")
    
    if (typesDTsContents.includes(`/// <reference types='${specifier}' />`)) { return }
    if (typesDTsContents.includes(`/// <reference types="${specifier}" />`)) { return }
    
    const newTypesDTsContents = typesDTsContents.replace(
        `/// <reference types='astro/client' />`,
        `/// <reference types='astro/client' />\n/// <reference types='${specifier}' />\n`
    ).replace(
        `/// <reference types="astro/client" />`,
        `/// <reference types="astro/client" />\n/// <reference types="${specifier}" />\n`
    )
    
    // the odd case where the user changed the reference to astro/client
    if (newTypesDTsContents === typesDTsContents) { return }
    
    fs.writeFileSync(typesDTsPath, newTypesDTsContents)
    logger.info("Updated types.d.ts types")
}
