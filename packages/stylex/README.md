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

### React

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

### Svelte

The code within a `<script>` tag of a svelte component is run once for each use of the component. It is, therefore compiled into a function. Stylex requires the `stylex.create()` call to happen at the top-level of a module. Svelte allows you to write top-level code in a `<script context="module">` tag. All your style definitions must be made inside the module context, or imported from a separate module.

```svelte
<script context="module">
  import stylex from "@stylexjs/stylex"
  const colorStyles = stylex.create({
        red: {
            backgroundColor: 'red',
            borderColor: 'darkred',
        },
        green: {
            backgroundColor: 'lightgreen',
            borderColor: 'darkgreen',
        },
    });
</script>
<button {...stylex.attrs(colorStyles.red)} />
<button {...stylex.attrs(colorStyles.green)} />
```

### `stylex.attrs()` vs `stylex.props()`

The `stylex.props()` function returns the generated classes in the `className` prop. This works only for React and frameworks compatible with it. To improve usability with other frameworks, `@stylexjs/stylex` introduced `stylex.attrs()`. This function is identical to `stylex.props()`, except it returns the generated classes in the `class` prop.

Svelte only accepts `class` prop, so you would want to use `stylex.attrs()`. Meanwhile, React only accepts `className` prop - you would want to use `stylex.props()`, instead. Preact, and Solid accept both `class` and `className` props, and you are free to use either functions.


## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/stylex/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/stylex/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/stylex/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
