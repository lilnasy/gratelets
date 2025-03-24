# @emotion-extract/vite 👩‍🎤

This Vite plugin brings [Emotion's](https://emotion.sh/docs/introduction) CSS rules to server-rendered projects using React, Preact, Svelte, Vue, SvelteKit, Astro, Remix, or basically any Vite-based project.

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

`@emotion-extract/vite` takes Emotion to the next-level! Instead of generating stylesheets in the browser everytime your components render and re-render, it makes them available ahead of time, even before the browser has run any code. This greatly improves rendering performance, and improves Lighthouse metrics. Additionally, it is compatible with server components, which don't send any code to the browser at all.

It works by reading your components' source code, and creating stylesheets from it during build-time. This approach is often called "macros" or "runes". This integration offers two macros - `css`, and `injectGlobal`. The `css` template tag processes CSS properties and compiles them into a scoped class name, which you can add to your HTML elements. The `injectGlobal` template tag lets you add global styles to the current page.

Emotion is also a great choice to add styles to React, Preact, or Solid components, which don't have an out-of-the-box styling solution.

## Installation

First, install the `@emotion-extract/vite` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install --save-dev @emotion-extract/vite
```
Notice how we added the `--save-dev` flag. This is because Emotion Extract runs entirely during build time; none of its code runs in the browser or in the SSR app. If you are migrating from `@emotion/css` or `@emotion/react`, you can remove those packages from your dependency list.

Next, add the plugin to your `vite.config.*` file using the `plugins` array:

```diff lang="js" "emotion()"
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
+ import emotion from '@emotion-extract/vite';

// https://vite.dev/config/
export default defineConfig({
  // ...
  plugins: [react(), emotion()],
  // ...             ^^^^^^^^^
})
```
To enable autocomplete and type-safety hints, add an import statement for `@emotion-extract/vite/env`:
```diff lang="js" "emotion()"
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
+ import '@emotion-extract/vite/env';

// https://vite.dev/config/
export default defineConfig({
  // ...
})
```
If this step is skipped, you might see the following error message in your IDE:
```
Cannot find module 'emotion:extract' or its corresponding type declarations.ts(2307)
```

## Usage

Once the integration is installed and added to the configuration file, you can import the `css` and `injectGlobal` macros from the `"emotion:extract"` module inside your components.

```ts
// src/components/react.tsx
import { css, injectGlobal } from "emotion:extract"

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
import { css } from "emotion:extract"
const margin = "1rem"
const className = css`margin: ${margin};`
const element = <div className={className} />

```

Instead use CSS variables for values that may change:

```tsx
import { css } from "emotion:extract"
const margin = "1rem"
const className = css`margin: var(--margin);`
const element = <div style={{ "--margin": margin }} className={className} />
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy). The integration code is located at [packages/emotion-extract/vite.ts](https://github.com/lilnasy/gratelets/blob/main/packages/emotion-extract/vite.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/emotion-extract/CHANGELOG.md) for a history of changes to this integration.
