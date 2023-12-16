import fs from "node:fs"
import url from "node:url"
import path from "node:path"
import { globby } from "globby"
import type { AstroIntegration, AstroConfig, AstroIntegrationLogger } from "astro"

export interface Options {}

export default function (_?: Partial<Options>): AstroIntegration {
    return {
        name: "astro-typed-api",
        hooks: {
            "astro:config:setup" ({ updateConfig, config, logger }) {
                const pagesDir = new URL("pages", config.srcDir)
                const declarationFileUrl = new URL(".astro/typed-api.d.ts", config.root)
                updateConfig({ vite: { plugins: [{
                    name: "astro-typed-api/typegen",
                    enforce: "post",
                    async config() {
                        const filenames = await globby("**/*.{ts,mts}", { cwd: pagesDir })
                        injectEnvDTS(config, logger, declarationFileUrl)
                        generateTypes(filenames, pagesDir, declarationFileUrl)
                    }
                }] } })
                updateConfig({ vite: { ssr: { noExternal: ["astro-typed-api"] } } })
            }
        }
    }
}

async function generateTypes(filenames: string[], pagesDir: URL, declarationFileUrl: URL) {
    const dotAstroPath = path.dirname(url.fileURLToPath(declarationFileUrl))
    const pagesPath = url.fileURLToPath(pagesDir)
    fs.mkdirSync(path.dirname(url.fileURLToPath(declarationFileUrl)), { recursive: true })
    let declaration = ``
    declaration += `type CreateRouter<Routes> = import("astro-typed-api/types").CreateRouter<Routes>\n`
    declaration += `\n`
    declaration += `declare namespace TypedAPI {\n`
    declaration += `    interface Client extends CreateRouter<[\n`
    for (const filename of filenames) {
        const endpoint = filename.replace(/(\/index)?\.m?ts$/, "")
        const specifier = path.relative(dotAstroPath, path.join(pagesPath, filename)).replaceAll("\\", "/")
        declaration += `    `
        declaration += `    [${JSON.stringify(endpoint)}, typeof import(${JSON.stringify(specifier)})],\n`
    }
    declaration += `    ]> {}\n`
    declaration += `}\n`
    fs.writeFileSync(declarationFileUrl, declaration)
}

function injectEnvDTS(config: AstroConfig, logger: AstroIntegrationLogger, specifier: URL | string) {
    const envDTsPath = url.fileURLToPath(new URL("env.d.ts", config.srcDir))
    
    if (specifier instanceof URL) {
        specifier = url.fileURLToPath(specifier)
        specifier = path.relative(url.fileURLToPath(config.srcDir), specifier)
        specifier = specifier.replaceAll("\\", "/")
    }
    
    let envDTsContents = fs.readFileSync(envDTsPath, "utf8")
    
    if (envDTsContents.includes(`/// <reference types='${specifier}' />`)) { return }
    if (envDTsContents.includes(`/// <reference types="${specifier}" />`)) { return }
    
    const newEnvDTsContents = envDTsContents.replace(
        `/// <reference types='astro/client' />`,
        `/// <reference types='astro/client' />\n/// <reference types='${specifier}' />\n`
    ).replace(
        `/// <reference types="astro/client" />`,
        `/// <reference types="astro/client" />\n/// <reference types="${specifier}" />\n`
    )
    
    // the odd case where the user changed the reference to astro/client
    if (newEnvDTsContents === envDTsContents) { return }
    
    fs.writeFileSync(envDTsPath, newEnvDTsContents)
    logger.info("Updated env.d.ts types")
}
