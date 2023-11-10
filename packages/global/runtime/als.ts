import { AsyncLocalStorage } from "node:async_hooks"
import type { APIContext } from "astro"

export default new AsyncLocalStorage<APIContext>
