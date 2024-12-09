# astro-global

## 2.0.0

### Major Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the types are automatically added to your project when you import the integration to the Astro configuration file.

  References to `astro-global/client` for types can now safely be removed from your project.

### Minor Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to allow access to more properties: `Astro.routePattern`, `Astro.originPathname`, and `Astro.isPrerendered`.

## 1.3.0

### Minor Changes

- [#102](https://github.com/lilnasy/gratelets/pull/102) [`0f7f2df`](https://github.com/lilnasy/gratelets/commit/0f7f2dfa23e6f7f97370c09699c77ebb7468ac52) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to allow access to more properties: `Astro.rewrite()`, `Astro.getActionResult()`, and `Astro.callAction()`.

## 1.2.1

### Patch Changes

- [#18](https://github.com/lilnasy/gratelets/pull/18) [`d3d79d9`](https://github.com/lilnasy/gratelets/commit/d3d79d9cee8b501f81b9105ede6cb0551a91b505) Thanks [@lilnasy](https://github.com/lilnasy)! - Prevents errors and warnings when installing alongside Astro v4.

## 1.2.0

### Minor Changes

- [#11](https://github.com/lilnasy/gratelets/pull/11) [`b9b6eb0`](https://github.com/lilnasy/gratelets/commit/b9b6eb08e02e47cf0538267354718d3c4532b0b2) Thanks [@lilnasy](https://github.com/lilnasy)! - Astro.currentLocale, introduced in Astro 3.6, can now be accessed from the module.

## 1.1.0

### Minor Changes

- [#3](https://github.com/lilnasy/gratelets/pull/3) [`86c6e6a`](https://github.com/lilnasy/gratelets/commit/86c6e6ac64ee789caa6633868d830719fab2fa1a) Thanks [@lilnasy](https://github.com/lilnasy)! - The integration now automatically updates your project types to include the "astro:global" module.

## 1.0.1

### Patch Changes

- [`1f4ffff`](https://github.com/lilnasy/gratelets/commit/1f4ffff33303daa06cd8d829aa06d9440e539b1d) Thanks [@lilnasy](https://github.com/lilnasy)! - Creates README.md
