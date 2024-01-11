# astro-server-only-modules 🗣️

This **[Astro integration][astro-integration]** lets you explicitly mark modules whose code should never be sent to the browser.

- <strong>[Why astro-server-only-modules?](#why-astro-server-only-modules)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-server-only-modules?


## Installation

### Manual Install

First, install the `astro-server-only-modules` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-server-only-modules
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "mdx()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  import mdx from '@astrojs/mdx';
+ import serverOnlyModules from 'astro-server-only-modules';

  export default defineConfig({
    // ...
+   integrations: [serverOnlyModules()],
    //             ^^^^^^^^^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, rename modules that should only be used within the server to end with `.server.ts`.

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/server-only-modules/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/server-only-modules/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/server-only-modules/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
