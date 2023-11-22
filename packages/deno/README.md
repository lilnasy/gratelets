# astro-deno 🌐

This **[Astro adapter][astro-adapter]** allows you to deploy your statically-built or server-rendered app to Deno.

- <strong>[Why astro-deno?](#why-astro-deno)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Configuration](#configuration)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-deno?

Deno is a runtime similar to Node, but with an API that's more similar to the browser's API. This adapter provides access to Deno's API and creates a script to run your project on a Deno server.

## Installation

### Manual Install

First, install the `astro-deno` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-deno
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "mdx()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import deno from 'astro-deno';

  export default defineConfig({
    // ...
+   adapter: deno(),
    //      ^^^^^^^
  });
```

## Usage

After performing a [build](https://docs.astro.build/en/reference/cli-reference/#astro-build) there will be a `dist/server/entry.mjs` module. You can run it directly using deno:

```sh
deno run -A dist/server/entry.mjs
```
### Configuration

To configure this adapter, pass an object to the deno() function call in astro.config.mjs.

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import deno from 'astro-deno';

export default defineConfig({
  output: 'server',
  adapter: deno({
    //options go here
  }),
});
```

### port and hostname

You can set the port (default: `4321`) and hostname (default: `localhost`) for the deno server to use. If start is false, this has no effect; your own server must configure the port and hostname.

```ts
import { defineConfig } from 'astro/config';
import deno from 'astro-deno';

export default defineConfig({
  output: 'server',
  adapter: deno({
    port: 8000,
    hostname: '0.0.0.0',
  }),
});
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/deno/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/deno/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/deno/CHANGELOG.md) for a history of changes to this integration.

[astro-adapter]: https://docs.astro.build/en/guides/server-side-rendering/
