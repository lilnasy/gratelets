import url from "node:url";
import path from "node:path";
/// <reference path="./types.d.ts" />
// ./node_modules/astro/dist/core/index.js
const astroEntry = import.meta.resolve("astro");
const consts = new URL("../content/consts.js", astroEntry);
const { PROPAGATED_ASSET_FLAG } = await import(consts.href);
export default function (_) {
    return {
        name: "astro-dynamic-import",
        hooks: {
            "astro:config:setup"({ config, updateConfig }) {
                const srcDirName = path.relative(url.fileURLToPath(config.root), url.fileURLToPath(config.srcDir)).replaceAll("\\", "/");
                updateConfig({ vite: {
                        optimizeDeps: {
                            exclude: ["astro-dynamic-import:internal"],
                        },
                        plugins: [{
                                name: "astro-dynamic-import/vite",
                                resolveId(source) {
                                    if (source === "astro:import") {
                                        return this.resolve("astro-dynamic-import/runtime/virtual-module.ts");
                                    }
                                    if (source === "astro-dynamic-import:internal")
                                        return source;
                                },
                                load(id) {
                                    if (id === "astro-dynamic-import:internal") {
                                        return `export const srcDirName = ${JSON.stringify(srcDirName)}\n` +
                                            `export const lookupMap = import.meta.glob('/${srcDirName}/components/**/*.astro', { query: { ${PROPAGATED_ASSET_FLAG}: true } })\n`;
                                    }
                                }
                            }]
                    } });
            }
        }
    };
}
