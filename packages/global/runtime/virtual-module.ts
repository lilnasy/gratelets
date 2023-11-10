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
    }
} satisfies AstroGlobal

export class NoRequestError extends Error {
    override name = "NoRequestError"
    constructor(property: string) {
        super("The Astro global is always tied to a specific request, but it was accessed outside of one. Please make sure that it is only used while a request is being served.", { cause: "Attempt to access Astro." + property })
    }
}
