# astro-adds-to-head 🗣️

This **[Astro integration][astro-integration]** lets you explicitly mark components that add scripts and styles to the parent page.

- <strong>[Why astro-global?](#why-astro-global)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-adds-to-head?

Due to Astro's streaming, we only wait until the page's frontmatter has run before generating the `<head>` element. Frontmatter of a component cannot add scripts or stylesheets because by the time it is run, the `<head>` element is already sent to the browser so that it can start loading assets.

This becomes an issue when a component uses the content collections API. The `render()` function adds styles and scripts relevant to the content entry to the <head> element. Therefore, it must only be used in the routed page's frontmatter, not a component's. Using it elsewhere would lead to missing assets, as reported in this issue: withastro/astro#7761.

This integration gives you a way to fix this corner case by letting you explicitly mark components that may contribute styles or scripts. When a component is marked, Astro will wait until it is rendered before rendering the `<head>` element.

## Installation

### Manual Install

First, install the `astro-adds-to-head` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-adds-to-head
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "mdx()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  import mdx from '@astrojs/mdx';
+ import addsToHead from 'astro-adds-to-head';

  export default defineConfig({
    // ...
+   integrations: [addsToHead()],
    //             ^^^^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, add `export const addsToHead = true` to the component that calls the `render()` method of a content entry.

```astro
---
const { Content } = await Astro.props.entry.render();
export const addsToHead = true
---
<Content />
```


## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/global/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/adds-to-head/integration.ts). You're welcome to contribute by submitting an issue or opening a PR!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/adds-to-head/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
