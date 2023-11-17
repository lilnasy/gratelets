# astro-scope 🔭

This **[Astro integration][astro-integration]** allows you to get the hash used by the astro compiler to scope css rules.

- <strong>[Why astro-scope?](#why-astro-scope)</strong>
- <strong>[Installation](#installation)</strong>
- <strong>[Usage](#usage)</strong>
- <strong>[Troubleshooting](#troubleshooting)</strong>
- <strong>[Contributing](#contributing)</strong>
- <strong>[Changelog](#changelog)</strong>

## Why astro-scope?
🤷

## Installation

### Manual Install

First, install the `astro-scope` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install astro-scope
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```diff lang="js" "scope()"
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
+ import scope from 'astro-scope';

  export default defineConfig({
    // ...
    integrations: [scope()],
    //             ^^^^^^^
  });
```

## Usage

Once the Astro scope integration is installed and added to the configuration file, you can import the scope from the `"astro:scope"` namespace.

```astro
---
import scope from "astro:scope"
---
<h1>{scope}</h1>
```

You can also import the scope into a client-side script. The scope will be the same in the frontmatter and in the script.

```html
<script>
    import scope from "astro:scope"
    console.log(scope)
</script>
<h1>{scope}</h1>
```

Note that the Astro scope can only be imported inside a `.astro` file. Importing it into an API route, middleware or framework component will throw an error. If you need the scope of a particular astro component to be available to other components, you can pass it as a prop.

```astro
---
import scope from "astro:scope"
import Component from "./OtherComponent.jsx"
---
<Component {scope} />
```

## Troubleshooting

For help, check out the `Discussions` tab on the [GitHub repo](https://github.com/lilnasy/gratelets/discussions).

## Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro. The integration code is located at [packages/scope/integration.ts](https://github.com/lilnasy/gratelets/blob/main/packages/scope/integration.ts). You're welcome to contribute by opening a PR or submitting an issue!

## Changelog

See [CHANGELOG.md](https://github.com/lilnasy/gratelets/blob/main/packages/scope/CHANGELOG.md) for a history of changes to this integration.

[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
