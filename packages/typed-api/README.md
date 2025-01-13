# astro-typed-api ⌨️

This **[Astro integration][astro-integration]** offers a way to create type-safe API routes with no set-up and minimal concepts to learn.

- <strong>[Why astro-typed-api?](#why-astro-typed-api)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>


https://github.com/lilnasy/gratelets/assets/69170106/570bcf7b-8331-4a83-8731-a3628d8c80de


## Why astro-typed-api?

Astro's [API routes](https://docs.astro.build/en/core-concepts/endpoints) are a great way to serve dynamic content. However, they are completely detached from your front-end code. The responsibility of serializing and deserializing data is left to the developer, and there is no indication whether a refactor in API design is going to break some UI feature. 
This integration aims to solve these problems by providing a type-safe `api` object that is aware of the input and return types of your API routes. Inline with the Astro philosophy, it does this while introducing minimum concepts to learn.

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

Typed API routes are created using the `defineApiRoute()` function, which are then exported the same way that normal [API routes](https://docs.astro.build/en/core-concepts/endpoints) are in Astro.

```ts
// src/pages/api/hello.ts
import { defineApiRoute } from "astro-typed-api/server"

export const GET = defineApiRoute({
    fetch: (name: string) => `Hello, ${name}!`
)
```
The `defineApiRoute()` function takes an object with a `fetch` method. The `fetch` method will be called when an HTTP request is routed to the current endpoint. Parsing the request for structured data and converting the returned value to a response is handled automatically. Once defined, the API route becomes available for browser-side code to use on the `api` object exported from `astro-typed-api/client`:
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

Note that only endpoints within the `src/pages/api` directory are exposed on the `api` object. Additionally, the endpoints must all be typescript files. For example, `src/pages/x.ts` and `src/pages/api/x.js` will **not** be made available to `astro-typed-api/client`.

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

### Errors

Failures are everywhere and errors are a form of communication around them. As an application developer, you want to be able to understand the underlying reason and further communicate it to the user in terms that matter to them.

Accordingly, Typed API implements a usable and practical error handling system with two goals:
1. To provide a way for the developer to understand the cause.
2. To provide a convenient way to inform the user about the relevant details.

As an additional goal, Typed APIs aims to be secure by default. Errors intended to be read by developers (goal #1) are potentially exploitable when read by users (goal #2). As such, Typed API ensures that there is no ambiguity between the two. Information is never automatically sent to the clients; the details of the failure relevant to the user are explicitly provided by the developer.

The library meets these goals by maintaining a small set of documented errors (see [Client-side errors](#client-side-errors) and [Server-side errors](#server-side-errors)), and by providing an opt-in type-safe bridge for errors between the server and the client (see [Custom error handling](#custom-error-handling).)

#### Custom error handling



### Reference

#### Exported modules
- `astro-typed-api/client`: The client-side API.
    - `api`: The client-side API object.
    - ... and the error constructors from `astro-typed-api/errors/client`.
- `astro-typed-api/server`: The server-side functions and values.
    - `defineApiRoute()`: The function for defining API routes.
    - `defineEndpoint()`: An alias for `defineApiRoute()`.
    - `type TypedAPIHandler`: The interface for a fetch handler used by `defineApiRoute()`.
    - `type ZodAPIHandler`: The interface for a fetch handler that also validates the input using a zod schema.
    - `type TypedAPIContext`: The interface for the context object passed to the fetch handler.
- `astro-typed-api/errors/client`: The errors that may be thrown by the client-side API.
    - `InvalidUsage`: Thrown when the client-side API is used incorrectly.
    - `NetworkError`: Thrown when there's a network failure while making the request.
    - `UnusableResponse`: Thrown when the server returns a response with a non-200 status code.
    - `CustomError`: Thrown when the server returns a custom error.
- `astro-typed-api/errors/server`: The server-side errors.
    - `InvalidUsage`: Thrown when the server-side API route defines a schema, but the schema does not have a `parse` method.
    - `ValidationFailed`: Thrown when the server-side API route defines a schema, and the data sent by a client does not match the schema.
    - `UnusableRequest`: Thrown when the request does not include expected headers or is otherwise malformed.
    - `ProcedureFailed`: Thrown when an error occurs inside fetch handler.
    - `OutputNotSerializable`: Thrown when the fetch handler returns data that cannot be serialized using JSON or devalue.
- `astro-typed-api/types`: Internally used generics.

#### `astro-typed-api/client`: The client-side API

##### `api`: The proxy object representing your API routes

The `api` object enables "object API mapping" to your server-side API routes. It is a `Proxy` object that can be indexed into to attrive at a certain endpoint. For example, `api.user.posts` selects `/api/user/posts` as the endpoint. This is followed by the selection of the HTTP method, and the `fetch()` invocation. For example, `api.user.posts.GET.fetch()` selects `/api/user/posts` as the endpoint and `GET` as the HTTP method, and then makes the request to that endpoint using the `GET` method.

This runtime behavior is combined with type generation to provide statically analysable usage. For example, if `src/api/user/posts.ts` does not export a `POST` method, then any code using `api.user.posts.POST` will error during type-checking.

#### `astro-typed-api/server`: The server-side API

##### `defineApiRoute()`

Creates a `Request -> Response` function that astro can use as an API route, while storing the paramter and return types for type-checking on the client-side. Accepts a single object that implements either the `TypedAPIHandler` or `ZodAPIHandler` interface.

```ts
// src/pages/api/username/availability.ts
import { defineApiRoute, TypedAPIHandler } from "astro-typed-api/server"

/**
 * Checks if a username is available or already taken.
 */
const handler: TypedAPIHandler<{ name: string }, { username_available: boolean }> = {
    fetch({ name }) {
        if (db.query(`SELECT * FROM users WHERE username = ${name}`)) {
            return { username_available: false }
        }
        return { username_available: true }
    }
}

export const GET = defineApiRoute(handler)
```

##### `defineEndpoint()`

An alias for `defineApiRoute()`, because API Route is too many syllables, and it's the casing for it is not consistent in the ecosystem.

```ts
import { defineEndpoint } from "astro-typed-api/server"

export const GET = defineEndpoint({
    fetch({ name }: { name: string }) {
        if (db.query(`SELECT * FROM users WHERE username = ${name}`)) {
            return { username_available: false }
        }
        return { username_available: true }
    }
})
```

##### `TypedAPIContext`

The interface represnting the object passed to the fetch handler as the second argument.

```ts
interface TypedAPIContext extends APIContext {
    response: ResponseOptions
    error(details: ErrorDetails, response?: Partial<ResponseOptions>): Response
}

interface ErrorDetails {
    type: string
    message?: string
}

interface ResponseOptions {
    status: number
    headers: Headers
}
```

The interface includes all fields from Astro's [APIContext](https://docs.astro.build/en/reference/api-reference/#endpoint-context), which is also used in normal API routes and in the middleware. Additionally, it includes two fields:
- `response`: a mutable object that can be used to set the status code and headers of the response.
- `error()`: a function that can be used to send a custom error message to the client.

##### `TypedAPIHandler`

A generic interface whose input and output types are automatically inferred by `defineApiRoute()`.

```ts
interface TypedAPIHandler {
    fetch(input: Input, context: TypedAPIContext): Promise<Output>
}
```

##### `ZodAPIHandler`

The interface for a fetch handler that also validates the input using a zod schema.

```ts
interface ZodAPIHandler extends TypedAPIHandler {
    schema: ZodTypeAny
}
```

#### `astro-typed-api/errors/client`: Client-side errors

When using the client-side API, there is a known set of errors that can occur:  `InvalidUsage`, `NetworkError`, `UnusableResponse`. Additionally, when the server intentionally wants to refuse a request, or provide a user-facing reason for failure, it can return a custom error, which becomes catchable as `CustomError`.

The constructors for all of these errors are exported from `astro-typed-api/client` and `astro-typed-api/client/errors`.

##### `NetworkError`

Thrown when there's a network failure while making the request, such as when the browser is offline or the server is unreachable.

Error properties:
- `error.cause`: The underlying error thrown by the fetch API, usually an instance of `TypeError`.

Example:
```ts
import { api, NetworkError } from "astro-typed-api/client"

const data = await api.user.GET.fetch(input).catch(error => {

    const isNetworkError = error instanceof NetworkError
    // or
    const isNetworkError = error.name === "TypedAPI.NetworkError"

    if (isNetworkError) {
        // show a user-friendly error message
        toast.error("Could not contact the server. Is the device connected to the internet?")
        // send the underlying error to a logging service
        log("fetch failed", error.cause)
    }
})
```

##### `UnusableResponse`

Thrown in two scenarios:
- When the server returns a response with a non-200 status code.
- When the response has an unexpected format (neither JSON nor devalue).

In either scanarios, the reason may be that the server ran into an an unhandled error while running the request. Alternatively. there was an intermediate server (nginx, cloudflare or other reverse proxy) that refused the request due to, for example, the user hitting a rate-limit.

Properties:
- `error.type`: The reason for the failure. The value may be one of the strings `"not ok"` and `"unknown format"`.
- `error.cause`: The unsuccessful response object returned by the server.

Example:

```ts
import { api, UnusableResponse } from "astro-typed-api/client"

const data = await api.posts.GET.fetch(input).catch(error => {

    const isUnusableResponse = error instanceof UnusableResponse
    // or
    const isUnusableResponse = error.name === "TypedAPI.UnusableResponse"

    if (isUnusableResponse) {
        if (error.cause.status === 429) {
            toast.error("You've hit a rate limit. Please wait and try again later.")
        }
    }
}
```

##### `InvalidUsage`

Thrown when the library client is used incorrectly. In most cases, this runtime error has a corresponding type error preventing the invalid usage during development.

For example:
- When calling methods other than `fetch`.
- When the HTTP method is missing for an `ALL` handler
- When the HTTP method is not uppercase

Properties:
- `error.type`: The reason for the failure. The value may be one of the strings `"incorrect call"`, `"missing method"`, and `"invalid method"`.
- `error.message`: A developer-readable explanation of the invalid usage.

Example:
```ts
try {
    // The function being called must be `fetch`
    api.endpoint.GET()
    
    // The actual method is expected to be passed as an option, but it is not provided here
    api.endpoint.ALL.fetch(input)
    
    // The method is not uppercase
    api.endpoint.get.fetch(input)
} catch (error) {
    if (error.name === "TypedAPI.InvalidUsage") {
        console.log(error.message) // Detailed explanation of what went wrong
    }
}
```

##### `CustomError`

Refer to [Error handling](#error-handling).

#### `astro-typed-api/errors/server`: Server-side errors

##### `InvalidUsage`

Thrown when the server-side API route defines a schema, but the schema does not have a `parse` method. This may be the result of using a non-zod schema or a schema that is not defined in the file where the API route is defined.

Properties:
- `error.type`: The reason for the failure. Currently, this is always `"invalid schema"`.
- `error.schema`: The invalid schema object that was passed to the `defineApiRoute()` function in the `schema` field.

##### `ValidationFailed`

Thrown when the server-side API route defines a schema, and the data sent by a client does not match the schema.

Properties:
- `error.cause`: The `ZodError` describing the validation failure.
- `error.input`: The deserialized non-validatable input sent by the client.

##### `UnusableRequest`

Thrown when the request does not include expected headers or is otherwise malformed.

Properties:
- `error.type`: The reason for the failure. The value may be one of the strings `"accept header missing"`, `"unsupported accept header"`, `"unsupported content type"`, and `"deserialization failed"`.
- `error.request`: The request object that was passed to the fetch handler.
- `error.deserializationError`: If the reason is `"deserialization failed"`, this is the error thrown by `JSON.parse()` or `devalue`.

##### `ProcedureFailed`

A wrapper error thrown when an error occurs inside fetch handler.

Properties:
- `error.cause`: The error thrown during the execution of the fetch handler.

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/typed-api/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/typed-api/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/typed-api/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
