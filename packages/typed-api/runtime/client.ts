import { proxyTarget, proxyHandler } from "./client-internals.ts"
import type { MapAny } from "../types.ts"
export { InvalidUsage, NetworkError, UnusableResponse, CustomError } from "./errors.client.ts"

export const api: Client = new Proxy(proxyTarget, proxyHandler) as any

type Client = MapAny<
    // @ts-ignore this doesn't exist until .astro/integrations/typed-api/types.d.ts is generated
    TypedAPI.Client,
    "The types for the client have not been generated yet. Try running `npm exec astro sync`."
>
