import type { SimpleVisitors } from "acorn-walk"
import type { Emotion } from "@emotion/css/create-instance"
import type MagicString from "magic-string"

export interface State {
    id: string
    css: Emotion["css"]
    injectGlobal: Emotion["injectGlobal"]
    magicString: MagicString
    importedOnce?: boolean
    namespace?: string | undefined
    cssFunctionLocalName?: string | undefined
    injectGlobalLocalName?: string | undefined
}

export const visitors: SimpleVisitors<State> = {
    ImportDeclaration(node, state) {
        if (node.source.value !== "astro:emotion") return
        if (state.importedOnce) {
            throw new Error(
                "'astro:emotion' must only be imported once per file",
                { cause: `'${state.id}' imported 'astro:emotion' multiple times.` }
            )
        }
        state.importedOnce = true
        for (const specifier of node.specifiers) {
            if (specifier.type === "ImportNamespaceSpecifier") {
                state.namespace = specifier.local.name
            }
            else if (specifier.type === "ImportSpecifier") {
                const { imported, local } = specifier
                if (
                    // import { css } from "astro:emotion"
                    (imported.type === "Identifier" && imported.name === "css") ||
                    // import { css as localName } from "astro:emotion"
                    (imported.type ===  "Literal" && imported.value === "css")
                ) {
                    state.cssFunctionLocalName = local.name
                }
                else if (
                    // import { injectGlobal } from "astro:emotion"
                    (imported.type === "Identifier" && imported.name === "injectGlobal") ||
                    // import { injectGlobal as localName } from "astro:emotion"
                    (imported.type ===  "Literal" && imported.value === "injectGlobal")
                ) {
                    state.injectGlobalLocalName = local.name
                }
            }
            else {
                throw new StacklessError(
                    "'astro:emotion' does not export a default value. Did you mean to import 'css'?\n\n" +
                    "import { css } from 'astro:emotion'\n",
                    { cause: `'${state.id}' tried to import default as '${specifier.local.name}' from 'astro:emotion''` }
                )
            }
        }
        state.magicString.remove(node.start, node.end)
    },
    TaggedTemplateExpression(node, state) {
        const { tag, quasi } = node
        if (
            (
                tag.type === "Identifier" &&
                tag.name === state.cssFunctionLocalName
            ) || (
                tag.type === "MemberExpression" &&
                tag.object.type === "Identifier" &&
                tag.object.name === state.namespace &&
                tag.property.type === "Identifier" &&
                tag.property.name === "css"
            )
        ) {
            if (quasi.expressions.length > 0) {
                throw new StacklessError(
                    "Interpolations are not supported in 'css' tagged template literals",
                    { cause: `'${state.id}' used an interpolation in a 'css' tagged template literal` }
                )
            }
            const [ templateElement ] = quasi.quasis
            const cssRuleBody = templateElement.value.cooked
            if (cssRuleBody === null || cssRuleBody === undefined) {
                throw new Error(
                    "Unexpected Error: The 'css' tagged template literal's value could not be read from the parsed source code.\n" +
                    "This is a bug in astro-emotion. Please open an issue with reproduction steps.",
                    { cause: `'${state.id}' could not be processed by 'astro-emotion'` }
                )
            }
            const className = state.css([cssRuleBody])
            state.magicString.overwrite(node.start, node.end, JSON.stringify(className))
        }
        else if (
            (
                tag.type === "Identifier" &&
                tag.name === state.injectGlobalLocalName
            ) || (
                tag.type === "MemberExpression" &&
                tag.object.type === "Identifier" &&
                tag.object.name === state.namespace &&
                tag.property.type === "Identifier" &&
                tag.property.name === "injectGlobal"
            )
        ) {
            if (quasi.expressions.length > 0) {
                throw new StacklessError(
                    "Interpolations are not supported in 'injectGlobal' tagged template literals",
                    { cause: `'${state.id}' used an interpolation in a 'injectGlobal' tagged template literal` }
                )
            }
            const [ templateElement ] = quasi.quasis
            const cssRuleBody = templateElement.value.cooked
            if (cssRuleBody === null || cssRuleBody === undefined) {
                throw new Error(
                    "Unexpected Error: The 'injectGlobal' tagged template literal's value could not be read from the parsed source code.\n" +
                    "This is a bug in astro-emotion. Please open an issue with reproduction steps.",
                    { cause: `'${state.id}' could not be processed by 'astro-emotion'` }
                )
            }
            state.injectGlobal([cssRuleBody])
            state.magicString.remove(node.start, node.end)
        }
    }
}

// the stacktrace is noisy and unhelpful 😠
class StacklessError extends Error { stack = undefined }
