# astro-client-interaction 👆

This **[Astro integration][astro-integration]** lets you load and hydrate framework components on first interaction by introducing the `client:interaction` directive.

- <strong>[Why astro-client-interaction?](#why-astro-client-interaction)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-client-interaction?

This integration is useful when you have several components that may never be interacted with, and are non-essential to your visitors' experience. Delaying their loading and hydration can help improve the performance of your site by reducing the amount of bandwidth usage and main-thread work that needs to be done on the initial page load.

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

Once the integration is installed and added to the configuration file, you can add the `client:interaction` directive to any component that should only hydrate after the visitor presses a key, clicks or touches any part of the page.

```astro
---
import Component from "../components/Counter.jsx"
---
<Component client:interaction />
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/client-interaction/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/client-interaction/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/client-interaction/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
