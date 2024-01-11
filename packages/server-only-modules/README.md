# astro-server-only-modules 🗣️

This **[Astro integration][astro-integration]** allows you to make sure you never leak security-sensitive code to the browser.

- <strong>[Why astro-server-only-modules?](#why-astro-server-only-modules)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-server-only-modules?

In a large codebase, it can be difficult to keep track of how code is being shared and where. This becomes a security risk when you have critical information that should only be available to the server. There are parts of your infrastructure that the browser (and therefore, a malicious user) does not need to be privy to.

This integration allows you to delineate the context of your code to only include it in the server app. If one of the modules ending with `.server.ts` extension accidentally gets imported by client-side, directly or indirectly, the build will fail.

## Installation

### Manual Install

First, install the `astro-server-only-modules` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-server-only-modules
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "serverOnlyModules()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import serverOnlyModules from 'astro-server-only-modules';

  export default defineConfig({
    // ...
+   integrations: [serverOnlyModules()],
    //             ^^^^^^^^^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, rename modules that should only be used within the server to end with `.server.ts`. If one of these modules accidentally gets imported by client-side, directly or indirectly, the build will fail.

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/server-only-modules/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/server-only-modules/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/server-only-modules/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
