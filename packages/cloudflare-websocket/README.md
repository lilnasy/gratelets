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

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro.

The code for this package is commited to the repository as a series of patches applied on top of the [`withastro/adapters`](https://github.com/withastro/adapters) repository, which is where the code for the `@astrojs/cloudflare` adapter is maintained. Additionally, the `withastro/adapters` repository is added as a git submodule to make it easier to update the patches. The [`package.json`](https://github.com/lilnasy/gratelets/blob/main/packages/cloudflare-websocket/package.json#L43-L47) file contains scripts to automatically manage the upstream repository and the patches.

To introduce a change, make sure you're in `packages/cloudflare-websocket` directory:
```bash
../gratelets/ $ cd packages/cloudflare-websocket
```
If the folder is empty, it means that the submodule needs to be cloned from github:
```bash
../gratelets/packages/cloudflare-websocket/ $ git submodule update --init .
```
Then, run the `load_patches` script using `pnpm` to clone the upstream repository and apply the patches:
```bash
../gratelets/packages/cloudflare-websocket/ $ pnpm run load_patches
```
Now, you can browse around the code by going into the `withastro/adapters` submodule:
```bash
../gratelets/packages/cloudflare-websocket/ $ cd withastro/adapters/packages/cloudflare
../withastro/adapters/packages/cloudflare/ $ code .
```
After you've made the changes you want, you can commit them as normal. However, instead of pushing the changes, you would update the patches by running `create_patches` script using `pnpm`:
```bash
../gratelets/packages/cloudflare-websocket/ $ pnpm run create_patches
```
This will add and update patches present in `packages/cloudflare-websocket` with the changes you've made.

Now, you can commit these patch files to the gratelets repository, and push.
```bash
../withastro/adapters/packages/cloudflare/ $ cd ../../../..
../gratelets/packages/cloudflare-websocket/ $ git commit -m "fix bug"
../gratelets/packages/cloudflare-websocket/ $ git push
```

### Updating the upstream repository
Steps to bring the package up-to-date with features and fixes added in the official `@astrojs/cloudflare` package:

If there have been changes made to package, ensure no work is lost by commiting the changes:
```bash
../cloudflare-websocket/withastro/adapters $ git commit -am "changes"
```
Fetch the latest tags from the upstream repository...
```bash
../cloudflare-websocket/withastro/adapters $ git fetch --tags
```
Make note of the hashes of the patch commits made on top of the upstream repository:
```bash
../cloudflare-websocket/withastro/adapters $ git log --oneline -n3
```
Checkout the tag corresponding to the latest release of `@astrojs/cloudflare` from the upstream repository:
```bash
../cloudflare-websocket/withastro/adapters $ git checkout tags/@astrojs/cloudflare@12.<minor>.<patch>
```
Cherry pick the commits we made note of earlier:
```bash
../cloudflare-websocket/withastro/adapters $ git cherry-pick <hash1> <hash2> <hash3>
```
Now, we can save the changes as patch files:
```bash
../cloudflare-websocket/withastro/adapters $ git format-patch tags/@astrojs/cloudflare@12.<minor>.<patch>  -o ../..
```

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/cloudflare-websocket/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/