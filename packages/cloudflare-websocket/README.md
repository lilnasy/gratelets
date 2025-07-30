# astro-cloudflare-websocket 🔌

This **[Astro integration][astro-integration]** provides an adapter for Astro that allows you to host SSG and SSR sites on [Cloudflare Workers](https://workers.cloudflare.com/), with realtime features using WebSocket.

- <strong>[Why astro-cloudflare-websocket?](#why-astro-cloudflare-websocket)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-cloudflare-websocket?

The `astro-cloudflare-websocket` integration allows you to handle WebSocket connections in your Astro project and deploy it on [Cloudflare Workers](https://workers.cloudflare.com/), with realtime features. You no longer need to maintain a separate WebSocket server and complicated build processes to add realtime features. You can handle WebSocket requests directly in your API Routes, middleware, and even in the frontmatter of your Astro pages!

As a fork of the official [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter, it provides the same configuration options, and remains backwards compatible with its features and behavior.

## Installation

### Manual Install

First, install the `astro-cloudflare-websocket` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-cloudflare-websocket
```

Then, add this integration to your `astro.config.*` file using the [`adapter`](https://docs.astro.build/en/reference/configuration-reference/#adapter) property:

```diff lang="js" "cloudflareWebSocket()"
    // astro.config.mjs
    import { defineConfig } from "astro/config"
-    import cloudflare from "@astrojs/cloudflare"
+    import cloudflareWebSocket from "astro-cloudflare-websocket"

    export default defineConfig({
        // ...
-        adapter: cloudflare()
+        adapter: cloudflareWebSocket(),
        // ...
    });
```

## Usage

The integration adds an `upgradeWebSocket()` method to the [`context.locals`](https://docs.astro.build/en/guides/middleware/#storing-data-in-contextlocals) object. This method returns an object with `response` and `socket` fields.

```ts
// src/pages/api/socket.ts
export const GET: APIRoute = ctx => {
    if (ctx.request.headers.get("upgrade") === "websocket") {
        const { response, socket } = ctx.locals.upgradeWebSocket()
        socket.addEventListener("message", event => {
            if (event.data === "ping") {
                socket.send("pong")
            }
        })
        return response
    }
    return new Response("Upgrade required", { status: 426 })
}
```

The `response` field provides a `Response` object that you can return to accept the WebSocket upgrade request. The `socket` field is a `WebSocket` object, which allows you to send messages to the browser and receive messages from it. This API of the `WebSocket` is fully compatible with the browser's [`WebSocket API`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), so you can program the server WebSocket in the same way you would program the browser WebSocket.

Note that this integration does not require any special client-side WebSocket library, you can use the native `WebSocket` API in the browser. Here is an example of the client-side code that connects to the above server WebSocket:

```astro
---
// src/pages/index.astro
---
<script>
    const socket = new WebSocket(`${location.origin}/api/socket`)
    socket onopen = event => {
        socket.send("ping")
    }
    socket.onmessage = event => {
        console.log(event.data)
    }
</script>
```

To simplify the detection of whether a request can be upgraded to a WebSocket connection, the adapter also adds `locals.isUpgradeRequest` to the context. This value is `true` if the request can be upgraded to a WebSocket connection, and `false` otherwise.

```diff lang="ts"
- if (ctx.request.headers.get("upgrade") === "websocket") { ... }
+ if (ctx.locals.isUpgradeRequest) { ... }
```

### Authorizing and rejecting requests

If the endpoint returns any response other than the one provided by `upgradeWebSocket()`, the upgrade request will be rejected, and a WebSocket connection will not be established. This enables you to easily implement authorization logic or other checks before accepting the upgrade request.

For example, the following code shows how you would check for the presence of a cookie:

```ts
// src/pages/api/socket.ts
export const GET: APIRoute = ctx => {
    const cookie = ctx.cookies.get("xyz")
    if (!cookie) {
        return new Response("Unauthorized", { status: 401 })
    }
    if (!ctx.locals.isUpgradeRequest) {
        return new Response("Upgrade Required", { status: 426 })
    }
    const { response, socket } = ctx.locals.upgradeWebSocket()
    handleWebSocket(socket)
    return response
}
```

When a `WebSocket` connection fails to establish, browsers do not provide specific information in the `error` event about the cause. A `WebSocket` connection can close "cleanly" if it was successfully established and then intentionally closed. Alternatively, it can close non-cleanly if the server becomes unreachable due to network issues or if the connection could not be established in the first place. See the MDN documentation for more information: [CloseEvent: wasClean property - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/wasClean).

## Troubleshooting

### Error: "The request must be an upgrade request to upgrade the connection to a WebSocket."

This error occurs when a connection upgrade attempt is made using `locals.upgradeWebSocket()` on a request that does not have the necessary headers.

On the server, verify that the request is an upgrade request by checking `locals.isUpgradeRequest` before calling `locals.upgradeWebSocket()`.

It is important to know that in the browser, the `fetch` API cannot be used to send an upgrade request. Make sure that you are instantiating the built-in `WebSocket` class. See examples on MDN: [WebSocket - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#examples).


For additional help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. You're welcome to contribute by opening a PR or submitting an issue!

For instructions on the maintainance of the integration, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/cloudflare-websocket/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/