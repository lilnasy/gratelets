# astro-hono 🔥

This adapter allows you to self-host your static or server-rendered Astro app on a Hono-powered server.

- <strong>[Why Astro Hono](#why-astro-hono)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Configuration](#configuration)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why Astro Hono

If you're using Astro as a static site builder—its behavior out of the box—you don't need an adapter.

If you wish to [use server-side rendering (SSR)](https://docs.astro.build/en/guides/server-side-rendering/), Astro requires an adapter that matches your deployment runtime.

[Hono](https://hono.dev/) is an HTTP framework that makes writing javascript servers simpler. `astro-hono` can be used to create an independent server, or a middleware for other hono-based servers.

## Installation

### Manual installation

1. Install the adapter to your project’s dependencies using your preferred package manager. If you’re using npm or aren’t sure, run this in the terminal:

```bash
npm install astro-hono
```

1. Add two new lines to your `astro.config.mjs` project configuration file.

```diff lang="js"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import hono from 'astro-hono';

  export default defineConfig({
+     output: 'server',
+      adapter: hono(),
  });
```

## Configuration

`astro-hono` can be configured by passing options into the adapter function. The following options are available:

### Mode

**Type:** `'standalone' | 'middleware'`<br>
**Default:** `'standalone'`<br>

The `standalone` mode creates a build that automatically starts a server. This allows you to easily run your production app without any additional code.

Advanced users might want the `middleware` mode, which allows the build output to be used as middleware for another Hono-powered server.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'middleware',
    }),
});
```

### host

**Type:** `string`<br>
**Default:** `'localhost'`<br>

The host the server will automatically listen on. This is only used in `standalone` mode. If the environment variable `HOST` is present at runtime, the value defined here will be ignored.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import hono from 'astro-hono';

export default defineConfig({
    output: 'server',
    adapter: hono({
        host: '127.0.0.1',
    })
});
```

### port

**Type:** `number`<br>
**Default:** `4321`<br>

The port the server will automatically listen on. This is only used in `standalone` mode.  If the environment variable `PORT` is present at runtime, the value defined here will be ignored.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import hono from 'astro-hono';

export default defineConfig({
    output: 'server',
    adapter: hono({
        port: 3000,
    })
});
```

## Usage

### Standalone

In standalone mode, a server starts when the server entrypoint is run. By default it is built to `./dist/server/entry.mjs`. You can run it with:

```shell
node ./dist/server/entry.mjs
```

For standalone mode the server handles file servering in addition to the page and API routes.

#### Custom host and port

You can also override the host and port the standalone server runs on by passing them as environment variables at runtime:

```shell
HOST=0.0.0.0 PORT=3000 node ./dist/server/entry.mjs
```

#### Assets

In standalone mode, assets in your `dist/client/` folder are served via the standalone server. You might be deploying these assets to a CDN, in which case the server will never actually be serving them. But in some cases, such as intranet sites, it's fine to serve static assets directly from the application server.

Assets in the `dist/client/_astro/` folder are the ones that Astro has built. These assets are all named with a hash and therefore can be given long cache headers. Internally the adapter adds this header for these assets:

```
Cache-Control: public, max-age=31536000, immutable
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/hono/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/hono/integration.ts). The server code is located at [packages/hono/runtime/server.ts]([packages/hono/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/hono/runtime/server.ts)). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/hono/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/