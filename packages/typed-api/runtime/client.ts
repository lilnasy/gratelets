// @ts-nocheck
import { proxyTarget, proxyHandler } from "./client-internals.ts"

export const client: Client = new Proxy(proxyTarget, proxyHandler)

type Client = MapAny<
    TypedAPI.Client,
    TypedAPIError<"The types for the client have not been generated yet. Try running `npm exec astro sync`.">
>

type MapAny<T, IfAny> = (T extends never ? true : false) extends false ? T : IfAny

interface TypedAPIError<T> { error: T }
