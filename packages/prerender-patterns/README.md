# astro-prerender-patterns💈

This **[Astro integration][astro-integration]** allows you control rendering modes for all pages and endpoints in a single place.

- <strong>[Why astro-prerender-patterns?](#why-astro-prerender-patterns)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-prerender-patterns?

If you are using astro for server side rendering, you can opt-in individual pages to be prerendered. However, you must do it by editing each file. This integration lets you control the rendering mode for all pages and endpoints right from the configuration file.

## Installation

### Manual Install

First, install the `astro-prerender-patterns` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-prerender-patterns
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import prerenderPatterns from 'astro-prerender-patterns';

  export default defineConfig({
    // ...
+   integrations: [prerenderPatterns()],
    //             ^^^^^^^^^^^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, you can pass it a function that lets you decide which routes get prerendered.

```js
export default defineConfig({
    // ...
    integrations: [
        prerenderPatterns(filePath => {
            if (filePath.endsWith(".astro")) return "prerender"
            if (filePath.endsWith(".ts")) return "render on demand"
        })
    ],
    // ...
});
```

The callback function receives the path of the file being rendered, relative to the root of your project. To override the current rendering mode, return either `"prerender"`, or `"render on demand"`. If neither of these two strings are returned, Astro's regular behavior as documented in [On⁠-⁠demand Rendering Adapters](https://docs.astro.build/en/guides/server-side-rendering/) applies.

If you would like to take into account the current rendering mode, you can read the second argument passed to the callback function:

```js
export default defineConfig({
    // ...
    integrations: [
        prerenderPatterns((file, currentMode) => {
            if (currentMode === "prerender") return "render on demand"
        })
    ],
    // ...
});
```

For convenience, the strings `"prerender"` and `"render on demand"` are exported from the package as `prerender` and `renderOnDemand` respectively. You can use these to prevent typing mistakes:

```js
import prerenderPatterns, { prerender, renderOnDemand } from "astro-prerender-patterns";
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/prerender-patterns/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/prerender-patterns/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/prerender-patterns/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
