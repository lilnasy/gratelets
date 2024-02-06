# astro-client-interaction 👆

This **[Astro integration][astro-integration]** ...

- <strong>[Why astro-client-interaction?](#why-astro-client-interaction)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-client-interaction?

## Installation

### Manual Install

First, install the `astro-client-interaction` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-client-interaction
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "clientIx()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import clienIx from 'astro-client-interaction';

  export default defineConfig({
    // ...
    integrations: [clienIx()],
    //             ^^^^^^^
  });
```

## Usage

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/client-interaction/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/client-interaction/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/client-interaction/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
