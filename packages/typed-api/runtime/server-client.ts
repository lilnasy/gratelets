import { proxyTarget } from "./client-internals.ts"
import { proxyHandler } from "./server-client-internals.ts"
export { InvalidUsage, NetworkError, UnusableResponse, CustomError } from "./errors.client.ts"

export const api = new Proxy(proxyTarget, proxyHandler)
