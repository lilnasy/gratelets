# astro-typed-api ⌨️

This **[Astro integration][astro-integration]** offers a way to create type-safe API routes with no set-up and minimal concepts to learn.

- <strong>[Why astro-typed-api?](#why-astro-typed-api)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-typed-api?


## Installation

### Manual Install

First, install the `astro-typed-api` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-typed-api
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "typedApi()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import typedApi from 'astro-typed-api';

  export default defineConfig({
    // ...
    integrations: [typedApi()],
    //             ^^^^^^^^
  });
```

## Usage

Typed API routes are created the same way that normal [API routes](https://docs.astro.build/en/core-concepts/endpoints) are created in Astro, but using `defineApiRoute()`.

```ts
// src/pages/api/hello.ts
import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch: (name: string) => `Hello, ${name}!`
)
```
The `defineApiRoute()` function takes an object with a `fetch` method. The `fetch` method will be called when an HTTP request is routed to the current endpoint, and the return value will be sent back to the client. Once defined, the API route becomes available for browser-side code to use on the `api` object exported from `astro-typed-api/client`:
```ts
---
// src/pages/index.astro
---
<script>
    import { api } from "astro-typed-api/client"

    const message = await api.hello.GET.fetch("lilnasy")
    console.log(message) // "Hello, lilnasy!"
</script>
```
When the `fetch` method is called on the browser, the arguments passed to it are serialized as query parameters and a `GET` HTTP request is made to the Astro server. The result is deserialized from the response and returned by the call.

Note that only endpoints within the `src/pages/api` directory are exposed on the `api` object. Additionally, the endpoints must all be typescript files. For example, `src/pages/admin/x.ts` and `src/pages/api/x.js` will **not** be made available to `astro-typed-api/client`.

### Type-safety

Types for newly created endpoints are automatically added to the `api` object while `astro dev` is running. You can also run [`astro sync`](https://docs.astro.build/en/reference/cli-reference/#astro-sync) to update the types.

Typed API stores the generated types inside [`.astro` directory](https://docs.astro.build/en/guides/content-collections/#the-astro-directory) in the root of your project. The files here are automatically created, updated and used.

### Input Validation

`defineApiRoute()` also accepts a [zod schema](https://docs.astro.build/en/guides/content-collections/#defining-datatypes-with-zod) in the definition. 
```ts
// src/pages/api/validatedHello.ts
import { defineApiRoute } from "astro-typed-api/server"
import { z } from "zod"

export const GET = defineApiRoute({
    schema: z.object({
        user: z.string(),
    }),
    fetch: ({ user }) => `Hello, ${user}!`,
)
```
When provided, the schema is used to validate the input passed to the `fetch` method. If the arguments are invalid, the API route returns a `500` response and the client-side call will throw. Additionally, the input type will be inferred from the schema.

### Using middleware locals

The `fetch()` method is provided Astro's [APIContext](https://docs.astro.build/en/reference/api-reference/#endpoint-context) as its second argument. This allows you to read any locals that have been set in a middleware.

```ts
// src/pages/api/adminOnly.ts
import { defineApiRoute } from "astro-typed-api/server"

export const POST = defineApiRoute({
    fetch: (name: string, { locals }) => {
        const { user } = locals
        if (!user) throw new Error("Visitor is not logged in.")
        if (!user.admin) throw new Error("User is not an admin.")
        ...
    }
)
```

### Setting cookies

The `APIContext` object also includes a set of utility functions for managing cookies which has the same interface as [`Astro.cookies`](https://docs.astro.build/en/reference/api-reference/#astrocookies).

```ts
// src/pages/api/setPreferences.ts
import { defineApiRoute } from "astro-typed-api/server"

export const PATCH = defineApiRoute({
    schema: z.object({
        theme: z.enum(["light", "dark"]),
    }),
    fetch: ({ theme }, { cookies }) => {
        cookies.set("theme", theme)
    }
)
```

### Adding response headers

The `TypedAPIContext` object extends `APIContext` by also including a `response` property which can be used to send additional headers to the browser and CDNs.

```ts
// src/pages/api/cached.ts
import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch: (_, { response }) => {
        response.headers.set("Cache-Control", "max-age=3600")
        return "Hello, world!"
    }
)
```

### Adding request headers

The client-side `fetch()` method on the `api` object accepts the same options as the global `fetch` as its second argument. It can be used to set request headers.

```astro
---
// src/pages/index.astro
---
<script>
    import { api } from "astro-typed-api/client"
    
    const message = await api.cached.GET.fetch(undefined, {
        headers: {
            "Cache-Control": "no-cache",
        }
    })
</script>
```

### Usage with React

Typed API does not include a hook of its own. However, it can be used with any React hook library that works with async functions. The following examples shows its usage with [`swr`](https://swr.vercel.app/).

```tsx
import useSWR from 'swr'
 
function Profile() {
  const { data, error, isLoading } = useSWR('getUser', api.user.GET.fetch)
 
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
  return <div>hello {data.name}!</div>
}
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/typed-api/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/typed-api/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/typed-api/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
