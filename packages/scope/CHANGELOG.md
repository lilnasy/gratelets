# astro-scope

## 3.0.0

### Major Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the types are automatically added to your project when you import the integration to the Astro configuration file.

  References to `astro-scope/client` for types can now safely be removed from your project.

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package fields to allow installation alongside Astro 5.

### Patch Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Improves reliability of using the Astro compiler to retrieve the scope.

## 2.0.0

### Major Changes

- [#69](https://github.com/lilnasy/gratelets/pull/69) [`654d7d8`](https://github.com/lilnasy/gratelets/commit/654d7d889b95de62c0336d9c880d7c19e95bd00b) Thanks [@lilnasy](https://github.com/lilnasy)! - Improves compatibility with recent versions of Astro. Minimum required astro version is now 4.2.2.
