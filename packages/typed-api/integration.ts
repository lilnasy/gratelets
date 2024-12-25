import fs from "node:fs"
import url from "node:url"
import path from "node:path"
import { globby } from "globby"
import type { AstroIntegration } from "astro"

export interface Options {
    /**
     * The serialization format to use for the API.
     * The value can be `"JSON"`, or `"devalue"`
     * 
     * - `"JSON"`: messages will be serialized using
     * the built-in `JSON.stringify()` and deserialized
     * using `JSON.parse()`.
     * 
     * - `"devalue"`: messages will be serialized
     * using the `stringify()` function and deserialized
     * using the `parse()` function from the [`devalue` npm
     * package](https://www.npmjs.com/package/devalue).
     */
    serialization?: "JSON" | "devalue"
}

export default function (options?: Partial<Options>): AstroIntegration {
    let apiDir: URL
    let root: URL
    let dotAstroDir: URL
    let declarationFileUrl: URL
    return {
        name: "astro-typed-api",
        hooks: {
            "astro:config:setup" ({ updateConfig, config }) {
                updateConfig({ vite: { plugins: [{
                    name: "astro-typed-api/typegen",
                    enforce: "post",
                    // the .astro directory is generated during astro sync command
                    // sync loads vite plugins but runs no astro hooks, config is
                    // the only hook available to generate types at the same time
                    // as sync
                    async configResolved() {
                        const filenames = await globby("**/*.{ts,mts}", { cwd: apiDir })
                        generateAndWriteDeclaration(filenames, apiDir, declarationFileUrl)
                    }
                }] } })
                updateConfig({
                    vite: {
                        define: {
                            "import.meta.env._TRAILING_SLASH": JSON.stringify(config.trailingSlash),
                            "import.meta.env.TYPED_API_SERIALIZATION": JSON.stringify(options?.serialization)
                        },
                        ssr: {
                            // this package is published as uncompiled typescript, which we need vite to process
                            noExternal: ["astro-typed-api"]
                        }
                    }
                })
            },
            async "astro:config:done"({ config, injectTypes }) {
                apiDir = new URL("pages/api", config.srcDir)
                root = config.root
                dotAstroDir = new URL('.astro/', root)

                const filenames = await globby("**/*.{ts,mts}", { cwd: apiDir })

                // The path to the generated declaration file will be returned
                // however we need the path to generate the relative specifiers.
                // As a "solution", we inject the types twice, first time to get
                // the file url, and second time to actually provide the content.
                // Astro will overwrite the file with the second entry.
                declarationFileUrl = injectTypes({
                    filename: "types.d.ts",
                    content: ""
                })
                injectTypes({
                    filename: "types.d.ts",
                    content: generateDeclaration(filenames, apiDir, declarationFileUrl)
                })
            },
            "astro:server:setup" ({ server }) {
                server.watcher.on("add", async path => {
                    if (path.includes("pages/api") || path.includes("pages\\api")) {
                        const filenames = await globby("**/*.{ts,mts}", { cwd: apiDir })
                        generateAndWriteDeclaration(filenames, apiDir, declarationFileUrl)
                    }
                })
            }
        }
    }
}

async function generateAndWriteDeclaration(filenames: string[], apiDir: URL, declarationFileUrl: URL) {
    fs.mkdirSync(new URL(".", declarationFileUrl), { recursive: true })
    fs.writeFileSync(declarationFileUrl, generateDeclaration(filenames, apiDir, declarationFileUrl))
}

function generateDeclaration(filenames: string[], apiDir: URL, declarationFileUrl: URL) {
    const apiPath = url.fileURLToPath(apiDir)
    let declaration = ``
    declaration += `type CreateRouter<Routes extends [string, unknown][]> = import("astro-typed-api/types").CreateRouter<Routes>\n`
    declaration += `\n`
    declaration += `declare namespace TypedAPI {\n`
    declaration += `    interface Client extends CreateRouter<[\n`
    for (const filename of filenames) {
        const endpoint = filename.replace(/(\/index)?\.m?ts$/, "")
        const specifier = path.relative(
            path.dirname(url.fileURLToPath(declarationFileUrl)),
            path.join(apiPath, filename)
        ).replaceAll("\\", "/")
        declaration += `    `
        declaration += `    [${JSON.stringify(endpoint)}, typeof import(${JSON.stringify(specifier)})],\n`
    }
    declaration += `    ]> {}\n`
    declaration += `}\n`
    return declaration
}
