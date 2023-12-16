import { proxyTarget, proxyHandler } from "./client-internals.ts"

// @ts-ignore
export const client: TypedAPI.Client = new Proxy(proxyTarget, proxyHandler)
