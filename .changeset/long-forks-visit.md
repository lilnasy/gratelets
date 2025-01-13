---
"astro-typed-api": minor
---

Adds support for type-safe custom error handling!

On the server-side, you now have access to the `error()` function in the `TypedAPIContext`.

```ts
import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch({ query }: { query: string }, { locals, error }) {
        if (locals.loggedInInfo) {
            return [ "search result 1", "search result 2" ]
        } else {
            return error("login required")
        }
    }
})
```

On the client-side, the error details are available inside the `.catch` handler.

```ts
import { api, CustomError } from "astro-typed-api/client"

const { data, error } =
    await api.search.GET.fetch({ query: "science" })
        .catch(error => {
            if (error instance of CustomError) {
                // error.reason is inferred from the server-side error() call
                const reason: "login required" = error.reason
            }
        })
```
