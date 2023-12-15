import { proxyTarget, proxyHandler } from "./client-internals.ts"

export const client: TypedAPI.Client = new Proxy(proxyTarget, proxyHandler) as any
