# astro-stylex 🎄

This **[Astro integration][astro-integration]** brings [StyleX's](https://stylexjs.com/docs/learn/) CSS compiler to every `.astro` file and [framework component](https://docs.astro.build/en/core-concepts/framework-components/) in your project.

- <strong>[Why StyleX](https://stylexjs.com/docs/learn/#ideal-use-cases)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Configuration](#configuration)</strong>
- <strong>[Examples](#examples)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Installation

### Manual Install

First, install the `astro-stylex` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-stylex @stylexjs/stylex
```

Next, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "stylex()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import stylex from 'astro-stylex';

  export default defineConfig({
    // ...
    integrations: [stylex()],
    //             ^^^^^^^^^
  });
```

## Usage

Once the integration is installed and added to the configuration file, you can import and use stylex as a normal library.

```ts
// src/components/react.jsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    color: 'rgb(60,60,60)',
    '@media (min-width: 800px)': {
      maxWidth: '800px',
    },
  },
  highlighted: {
    color: 'yellow',
    ':hover': {
      opacity: '0.9',
    },
  },
});

export function Component(props) {
  return (
    <div {...props} {...stylex.props([styles.root, props.highlighted])} />
  );
}
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/stylex/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/stylex/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/stylex/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
