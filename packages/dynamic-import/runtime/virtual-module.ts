import path from "node:path"
import {
    createComponent,
    createHeadAndContent,
    renderComponent,
    renderTemplate,
    renderUniqueStylesheet,
    renderScriptElement,
    unescapeHTML,
    type AstroComponentFactory
} from "astro/runtime/server/index.js"
//@ts-expect-error
import { srcDirName, lookupMap as _lookupMap } from "astro-dynamic-import:internal"
import type { SSRResult } from "astro"

const lookupMap: Record<string, Promise<AstroComponentFactory>> = {}
const processed: Array<string> = [];

export default async function(srcRelativeSpecifier: string) {
    const absoluteSpecifier = path.posix.join("/", srcDirName, srcRelativeSpecifier)
    const component = lookupMap[absoluteSpecifier]
    if (component === undefined) throw new DynamicImportError(srcRelativeSpecifier, absoluteSpecifier)
    return component
}

for (const absoluteSpecifier in _lookupMap) {
    const importable = _lookupMap[absoluteSpecifier]
    Object.assign(lookupMap, {
        get [absoluteSpecifier]() {
            lookupMap[absoluteSpecifier] = lazyImportToComponent(absoluteSpecifier, importable)
            return lookupMap[absoluteSpecifier]
        }
    })
}

async function lazyImportToComponent(absoluteSpecifier: string, importable: any) {
    const entry = await importable()
    const { collectedStyles, collectedLinks, collectedScripts, getMod } = entry.default
    const componentModule = await getMod()
    return createComponent({
        factory(result: SSRResult, props: Record<string, unknown>, slots: Record<string, unknown>) {
            const component = componentModule.default
            let styles = "";
            let links = "";
            let scripts = "";

            if (!processed.includes(component.name)) {
                styles = collectedStyles.map((style: any) => renderUniqueStylesheet(result, { type: 'inline', content: style })).join('')
                links = collectedLinks.map((link: any) => renderUniqueStylesheet(result, { type: 'external', src: prependForwardSlash(link) })).join('')
                scripts = collectedScripts.map((script: any) => renderScriptElement(script)).join('')
            }
            processed.push(component.name)
            return createHeadAndContent(unescapeHTML(styles + links + scripts) as any,
                renderTemplate`${renderComponent(
                    result,
                    `dynamically-imported:${component.name}`,
                    component,
                    props,
                    slots
                )}`
            )
        },
        moduleId: `dynamically-imported:${absoluteSpecifier}`,
        propagation: "self"
    })
}

class DynamicImportError extends Error {
    name = "DynamicImportError"
    constructor(unmatchedComponent: string, processedSpecifier: string) {
        let message = ''
        message += `Could not dynamically import '${unmatchedComponent}'\n`
        message += `'${processedSpecifier}' was not one of the following:\n`
        message += `${Object.keys(_lookupMap).map((specifier) => `  - ${specifier}`).join("\n")}`
        super(message)
    }
}

function prependForwardSlash(path: string) {
    return path[0] === "/" ? path : "/" + path;
}
