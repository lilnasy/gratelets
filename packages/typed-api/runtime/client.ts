import { proxyTarget, proxyHandler } from "./client-internals.ts"
import type { TypedAPITypeError, MapAny } from "../types.ts"

export const client: Client = new Proxy(proxyTarget, proxyHandler) as any

type Client = MapAny<
    TypedAPI.Client,
    TypedAPITypeError<"The types for the client have not been generated yet. Try running `npm exec astro sync`.">
>
