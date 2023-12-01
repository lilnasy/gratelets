# astro-emotion 👩‍🎤

This **[Astro integration][astro-integration]** brings [Emotion's](https://emotion.sh/docs/introduction) CSS rules to every `.astro` file and [framework component](https://docs.astro.build/en/core-concepts/framework-components/) in your project.

- <strong>[Why Emotion](#why-emotion)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Configuration](#configuration)</strong>
- <strong>[Examples](#examples)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why Emotion?

Emotion lets you colocate CSS rules with your JSX instead of having them in a separate file. You might find it easier to write and maintain your styles using vanilla CSS properties!

`astro-emotion` does not require a runtime to be sent to the browser or your SSR app. Instead, it works by reading your components' source code, and creating stylesheets from it during build-time. This approach is often called "macros" or "runes" in other ecosystems. This integration offers two macros - `css`, and `injectGlobal`. The `css` template tag processes CSS properties and compiles them into a scoped class name, which you can add to your HTML elements. The `injectGlobal` template tag lets you add global styles to the current page.

Emotion is also a great choice to add styles to React, Preact, or Solid components, which don't support a `<style>` tag in the component file.

## Installation

### Manual Install

First, install the `astro-emotion` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-emotion
```
Note: you do not need to install emotion separately. Installing this integration alone is sufficient.

Next, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "emotion()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import emotion from 'astro-emotion';

  export default defineConfig({
    // ...
    integrations: [emotion()],
    //             ^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, you can import the `css` and `injectGlobal` macros from the `"astro:emotion"` namespace.

```ts
// src/components/react.tsx
import { css, injectGlobal } from "astro:emotion"

injectGlobal`
  body {
    margin: 0;
    padding: 0;
  }
`

export default function () => (
  <div
    className={css`
      background-color: hotpink;
      &:hover {
        color: white;
      }
    `}
  >
    This has a hotpink background.
  </div>
)
```

## Limitations

Since the integration acts only during build-time, it cannot process dynamic styles. For example, this will not work:

```tsx
import { css } from "astro:emotion"
const margin = "1rem"
const className = css`margin: ${margin};`
const element = <div className={className} />

```

Instead use CSS variables for values that may change:

```tsx
import { css } from "astro:emotion"
const margin = "1rem"
const className = css`margin: var(--margin);`
const element = <div style={{ "--margin": margin }} className={className} />
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/emotion/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/emotion/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/emotion/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
