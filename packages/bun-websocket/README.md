# astro-bun-websocket 🔌

This **[Astro integration][astro-integration]** provides an adapter for Astro that allows you to host SSG and SSR sites on [Bun](https://bun.sh), with realtime features using WebSocket.

- <strong>[Why astro-bun-websocket?](#why-astro-bun-websocket)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-bun-websocket?

The `astro-bun-websocket` integration allows you to handle WebSocket connections in your Astro project and deploy it on [Bun](https://bun.sh), with realtime features. You no longer need to maintain a separate WebSocket server and complicated build processes to add realtime features. You can handle WebSocket requests directly in your API Routes, middleware, and even in the frontmatter of your Astro pages!

As a fork of the [`@NuroDev/astro-bun`](https://github.com/NuroDev/astro-bun/blob/main/package/README.md) adapter, it provides the same configuration options, and remains backwards compatible with its features and behavior.

## Installation

### Manual Install

First, install the `astro-bun-websocket` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-bun-websocket
```

Then, add this integration to your `astro.config.*` file using the [`adapter`](https://docs.astro.build/en/reference/configuration-reference/#adapter) property:

```diff lang="js" "bunWs()"
    // astro.config.mjs
    import { defineConfig } from "astro/config"
-    import bun from "@nurodev/astro-bun"
+    import bunWebSocket from "astro-bun-websocket"

    export default defineConfig({
        // ...
-        adapter: bun()
+        adapter: bunWebSocket(),
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
        socket.onmessage = event => {
            if (event.data === "ping") {
                socket.send("pong")
            }
        }
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

## Troubleshooting

### Error: "The request must be an upgrade request to upgrade the connection to a WebSocket."

This error occurs when a request is made to a WebSocket endpoint without the necessary headers to upgrade the connection. Note that within a browser, the globally-available `WebSocket` is the only way to create an upgrade request.

For additional help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro.

The code for this package is commited to the repository as a series of patches applied on top of the [`NuroDev/astro-bun`](https://github.com/NuroDev/astro-bun) repository, which is where the code for the `@NuroDev/astro-bun` adapter is maintained. Additionally, the `NuroDev/astro-bun` repository is added as a git submodule to make updating the patches easier. The [`package.json`](https://github.com/lilnasy/gratelets/blob/main/packages/bun-websocket/package.json#L34-L38) file contains scripts to automatically manage the upstream repository and the patches.

To introduce a change, make sure you're in `packages/bun-websocket` directory:
```bash
../gratelets/ $ cd packages/bun-websocket
```
Then, run the `load_patches` script using `pnpm` to clone the upstream repository and apply the patches:
```bash
../gratelets/packages/bun-websocket/ $ pnpm run load_patches
```
Now, you can browse around the code by going into the `NuroDev/astro-bun` submodule:
```bash
../gratelets/packages/bun-websocket/ $ cd NuroDev/astro-bun
../bun-websocket/NuroDev/astro-bun/ $ code .
```
Note that dependencies would need to separately be installed in the `NuroDev/astro-bun` submodule.
```bash
../bun-websocket/NuroDev/astro-bun/ $ bun install
```
After you've made the changes you want, you can commit them as normal. However, instead of pushing the changes, you would update the patches by running `create_patches` script using `pnpm`:
```bash
../bun-websocket/NuroDev/astro-bun/ $ pnpm run create_patches
```
This will add and update patches present in `packages/bun-websocket` with the changes you've made.

Now, you can commit these patch files to the gratelets repository, and push.
```bash
../bun-websocket/NuroDev/astro-bun/ $ cd ../..
../gratelets/packages/bun-websocket/ $ git commit -m "fix bug"
../gratelets/packages/bun-websocket/ $ git push
```

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/bun-websocket/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/