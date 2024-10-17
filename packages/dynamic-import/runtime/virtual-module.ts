import path from "node:path"
import {
    createComponent,
    createHeadAndContent,
    renderComponent,
    renderTemplate,
    renderUniqueStylesheet,
    renderScriptElement,
    unescapeHTML,
    type AstroComponentFactory,
    type ComponentSlots
} from "astro/runtime/server/index.js"
//@ts-expect-error
import { srcDirName, lookupMap as _lookupMap } from "astro-dynamic-import:internal"
import type { SSRResult } from "astro"

const lookupMap: Record<string, Promise<AstroComponentFactory>> = {}
/**
 * Everytime we propagate scripts and styles of a component onto a page,
 * we add the component to the set of components that have already been added against the page's SSRResult.
 * 
 * We use WeakMap and WeakSet to avoid holding references to the results and components,
 * allowing them to be removed from memory once used.
 */
const addedToPageMap = new WeakMap<SSRResult, WeakSet<AstroComponentFactory>>()

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
        factory(result: SSRResult, props: Record<string, unknown>, slots: ComponentSlots) {
            const component = componentModule.default
            
            const renderTemplateResult = renderTemplate`${renderComponent(
                result,
                `dynamically-imported:${component.name}`,
                component,
                props,
                slots
            )}`

            // if the component has already been added to the page, we render just the content, skipping duplicate head elements
            if (addedToPageMap.get(result)?.has(component)) return createHeadAndContent("", renderTemplateResult)

            // retrieve the set, and if it hasnt been created yet, create it, add it to the map, and then immediately retrieve it
            const setOfAddedComponents = addedToPageMap.get(result) ?? addedToPageMap.set(result, new WeakSet).get(result)!
            setOfAddedComponents.add(component)

            const styles = collectedStyles.map((style: any) => renderUniqueStylesheet(result, { type: 'inline', content: style })).join('')
            const links = collectedLinks.map((link: any) => renderUniqueStylesheet(result, { type: 'external', src: prependForwardSlash(link) })).join('')
            const scripts = collectedScripts.map((script: any) => renderScriptElement(script)).join('')
            
            return createHeadAndContent(unescapeHTML(styles + links + scripts) as any, renderTemplateResult)
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
