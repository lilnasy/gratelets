# astro-node-websocket 🌐

This **[Astro integration][astro-integration]** provides an SSR adapter for Astro that allows you to introduce realtime features using WebSocket within your SSR Astro project.

- <strong>[Why astro-node-websocket?](#why-astro-node-websocket)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-node-websocket?

The `astro-node-websocket` integration allows you to handle WebSocket connections in your Astro project and deploy it on Node.js or a Node.js-compatible runtime. You no longer need to maintain a separate WebSocket server and complicated build processes to add realtime features. You can handle WebSocket requests directly in your API Routes, middleware, event in the frontmatter of your Astro pages.

As a fork of the official `@astrojs/node` adapter, it provides the same configuration options, and remains backwards compatible with its features and behavior.

## Installation

### Manual Install

First, install the `astro-node-websocket` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-node-websocket
```

Then, add this integration to your `astro.config.*` file using the [`adapter`](https://docs.astro.build/en/reference/configuration-reference/#adapter) property:

```diff lang="js" "nodeWs()"
    // astro.config.mjs
    import { defineConfig } from "astro/config"
-    import node from "@astrojs/node"
+    import nodeWebSocket from "astro-node-websocket"

    export default defineConfig({
        // ...
-        adapter: node({ mode: "standalone" })
+        adapter: nodeWebSocket({ mode: "standalone" }),
        // ...
    });
```

Note that similar to the official `@astrojs/node` adapter, the [`mode`](https://docs.astro.build/en/guides/integrations-guide/node/#mode) option can be `"middleware"`. However, since this mode only exposes a middleware for you to add to a pre-existing server, WebSocket features are not available. To enable the WebSocket features, the adapter must create a full standalone server using `mode: "standalone"`.

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

The `response` field provides a `Response` object that you can return to accept the WebSocket upgrade request. The `socket` field is a `WebSocket` object, which allows you to send messages to the browser and receive messages from it. This API of the `WebSocket` is fully compatible with the browser's [`WebSocket API`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), so you can program the server WebSocket in the same way you would program the browser WebSocket. Here is an example of the client-side code that connects to the above server WebSocket:

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

Note that this integration does not require any special client-side WebSocket library, you can use the native `WebSocket` API in the browser.

## Troubleshooting

### Error: "The request must be an upgrade request to upgrade the connection to a WebSocket."

This error occurs when a request is made to a WebSocket endpoint without the necessary headers to upgrade the connection. Note that within a browser, the globally-available `WebSocket` is the only way to create an upgrade request.

For additional help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro.

The code for this package is commited to the repository as a series of patches applied on top of [withastro/adapters](https://github.com/withastro/adapters), which is where the code for the official `@astrojs/node` adapter is maintained. Additionally, the `withastro/adapters` repository added as a git submodule to make updating the patches easier. The `package.json` file contains scripts to automatically manage the upstream repository and the patches.

To introduce a change, make sure you're in `packages/node-websocket` directory:
```bash
../gratelets/ $ cd packages/node-websocket
```
Then, run the `load_patches` script using `pnpm` to clone the upstream repository and apply the patches:
```bash
../gratelets/packages/node-websocket/ $ pnpm run load_patches
```
Now, you can browse around the code by going into the `withastro/adapters` submodule:
```bash
../gratelets/packages/node-websocket/ $ cd withastro/adapters/packages/node
```
Note that dependencies would need to separately be installed in the `withastro/adapters` submodule. You can optionally provide the [`--filter`](https://pnpm.io/filtering) option to pnpm to install only the dependencies relevant to the node adapter package.
```bash
../adapters/packages/node/ $ pnpm --filter @astrojs/node install
```
After you've made the changes you want, you can commit them as normal. However, instead of pushing the changes, you would update the patches by running `create_patches` script using `pnpm`:
```bash
../adapters/packages/node/ $ pnpm run create_patches
```
This will add and update patches present in `packages/node-websocket` with the changes you've made.

Now, you can commit these patch files to the gratelets repository, and push.
```bash
../adapters/packages/node/ $ cd ../../../..
# with the *.patch filter, we avoid updating the submodule, which at this point
# no longer points to a commit in the withastro/adapters repository
../gratelets/packages/node-websocket/ $ git add *.patch
../gratelets/packages/node-websocket/ $ git commit -m "fix bug"
../gratelets/packages/node-websocket/ $ git push
```

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/node-websocket/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/