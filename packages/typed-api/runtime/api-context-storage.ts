import type { APIContext } from "astro"
import { AsyncLocalStorage } from "node:async_hooks"

export const apiContextStorage = new AsyncLocalStorage<APIContext>()
