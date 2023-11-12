# astro-global 🌐

This **[Astro integration][astro-integration]** enables the usage of the Astro global directly inside framework components and MDX pages.

- <strong>[Why astro-global?](#why-astro-global)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-global?

If you use MDX, this integration allows you to read locals, request url, cookies, and more info similarly to how you would normally read from the Astro global already available in `.astro` files.

## Installation

### Manual Install

First, install the `astro-global` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-global
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "mdx()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  import mdx from '@astrojs/mdx';
+ import global from 'astro-global';

  export default defineConfig({
    // ...
    integrations: [mdx(), global()],
    //                    ^^^^^^^
  });
```

## Usage

Once the Astro global integration is installed and added to the configuration file, you can import the `Astro` global from the `"astro:global"` namespace.

```mdx
{/* src/pages/index.mdx */}
import Astro from "astro:global"

### You are currently at {Astro.url.pathname}
```

```jsx
// src/components/preact.jsx
import Astro from "astro:global"

export default function () {
    return <p>You are currently at {Astro.url.pathname}</p>;
}
```
Note that the Astro global is only usable on the server. This means that the component using it must not have a [client directive](https://docs.astro.build/en/reference/directives-reference/#client-directives). If you need data from the Astro global to be available to interactive components, manually provide the relevant data as props so that it can be serialized and sent to the client.

### Intellisense and Typescript Support

For typescript support for the virtual module `"astro:global"`, add the following line to `src/env.d.ts`.
```diff lang="ts" "declare module 'astro:global';"
/// <reference types="astro/client" />
+ /// <reference types="astro-global/client" />
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/global/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/global/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/global/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
