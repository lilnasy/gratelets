import storage from "./als.ts"
import type { APIContext } from "astro"

export interface AstroGlobal extends Readonly<Omit<APIContext, "ResponseWithEncoding">> {}

export default {
    get clientAddress() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("clientAddress")
        return ctx.clientAddress
    },
    get cookies() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("cookies")
        return ctx.cookies
    },
    get generator() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("generator")
        return ctx.generator
    },
    get locals() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("locals")
        return ctx.locals
    },
    get params() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("params")
        return ctx.params
    },
    get preferredLocale() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("preferredLocale")
        return ctx.preferredLocale
    },
    get preferredLocaleList() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("preferredLocaleList")
        return ctx.preferredLocaleList
    },
    get props() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("props")
        return ctx.props
    },
    get redirect() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("redirect")
        return ctx.redirect
    },
    get request() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("request")
        return ctx.request
    },
    get site() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("site")
        return ctx.site
    },
    get url() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("url")
        return ctx.url
    },
    get currentLocale() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("currentLocale")
        return ctx.currentLocale
    },
    get rewrite() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("rewrite")
        return ctx.rewrite
    },
    get getActionResult() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("getActionResult")
        return ctx.getActionResult
    },
    get callAction() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("callAction")
        return ctx.callAction
    },
    get routePattern() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("routePattern")
        return ctx.routePattern
    },
    get originPathname() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("originPathname")
        return ctx.originPathname
    },
    get isPrerendered() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("isPrerendered")
        return ctx.isPrerendered
    },
    get insertDirective() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("insertDirective")
        return ctx.insertDirective
    },
    get insertStyleResource() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("insertStyleResource")
        return ctx.insertStyleResource
    },
    get insertStyleHash() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("insertStyleHash")
        return ctx.insertStyleHash
    },
    get insertScriptResource() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("insertScriptResource")
        return ctx.insertScriptResource
    },
    get insertScriptHash() {
        const ctx = storage.getStore()
        if (ctx === undefined) throw new NoRequestError("insertScriptHash")
        return ctx.insertScriptHash
    },
} satisfies AstroGlobal

export class NoRequestError extends Error {
    override name = "NoRequestError"
    constructor(property: string) {
        super("The Astro global is always tied to a specific request, but it was accessed outside of one. Please make sure that it is only used while a request is being served.", { cause: "Attempt to access Astro." + property })
    }
}
