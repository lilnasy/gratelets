# astro-dynamic-import 👩‍🎤

This **[Astro integration][astro-integration]** lets you import components dynamically, allowing you to pick and choose which components add their scripts and styles to the page. Now you can let a CMS or DB query decide your components without astro sending JS and CSS for all of them!

- <strong>[Why Import Dynamically](#why-import-dynamically)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why Import Dynamically?

Astro decides which scripts and styles get included on the page based on the import statements alone. If different components are picked based on the request, this heuristic quickly results in too many assets being sent to the browser. Importing dynamically lets you import components based on a condition and only the rendered components will send their associated assets to the browser.

## Installation

### Manual Install

First, install the `astro-dynamic-import` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-dynamic-import
```
Next, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "dynamicImport()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import dynamicImport() from 'astro-dynamic-import';

  export default defineConfig({
    // ...
    integrations: [dynamicImport()],
    //             ^^^^^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, you can import the default function from the `"astro:import"` namespace.

```astro
---
import dynamic from "astro:import"
const toImport = random() ? "components/Counter.astro" : "components/Ticker.astro"
const Component = await dynamic(toImport)
const initial = 3
---
<Component {initial} />
```

The `dynamic` function takes the path to a component relative to your source directory (`"/src"` by default). It returns a promise that resolves to the astro component.

Note that only `.astro` components can be imported. The components must be located in the `src/components` folder.

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/dynamic-import/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/dynamic-import/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/dynamic-import/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
