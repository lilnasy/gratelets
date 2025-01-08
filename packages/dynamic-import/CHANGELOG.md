# astro-dynamic-import

## 2.0.2

### Patch Changes

- [#126](https://github.com/lilnasy/gratelets/pull/126) [`47f496a`](https://github.com/lilnasy/gratelets/commit/47f496a6bfc42913a25dead817aa52b209d2007b) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where the integration could not import a required value (PROPAGATED_ASSET_FLAG) when installed in a monorepo.

## 2.0.1

### Patch Changes

- [#122](https://github.com/lilnasy/gratelets/pull/122) [`33ce679`](https://github.com/lilnasy/gratelets/commit/33ce6794df312fc3147cefa625a0c8f968ef1317) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where the integration attempted to read a file (env.d.ts) that does not exist in Astro 5.x projects.

## 2.0.0

### Major Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the types are automatically added to your project when you import the integration to the Astro configuration file.

  References to `astro-dynamic-import/client` for types can now safely be removed from your project.

## 1.1.2

### Patch Changes

- [#102](https://github.com/lilnasy/gratelets/pull/102) [`0f7f2df`](https://github.com/lilnasy/gratelets/commit/0f7f2dfa23e6f7f97370c09699c77ebb7468ac52) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to fix an internal type checking error. This release does not include any changes to runtime behavior.

## 1.1.1

### Patch Changes

- [#97](https://github.com/lilnasy/gratelets/pull/97) [`53c3047`](https://github.com/lilnasy/gratelets/commit/53c30470b08a356395f36f697863b5ae40635605) Thanks [@evertonadame](https://github.com/evertonadame)! - Fixes an issue where an internally used module (`"astro-dynamic-import:internal"`) would sometimes fail to be resolved by vite.

## 1.1.0

### Minor Changes

- [#88](https://github.com/lilnasy/gratelets/pull/88) [`3ec89c4`](https://github.com/lilnasy/gratelets/commit/3ec89c45d43736ed5b7ce13c66ae0d6ce5e26ef5) Thanks [@stevenwoodson](https://github.com/stevenwoodson)! - Dynamic imports are now even more optimized. Multiple uses of the same dynamically imported component will result in only one addition of the necessary scripts and styles.

## 1.0.2

### Patch Changes

- [#32](https://github.com/lilnasy/gratelets/pull/32) [`fb2111d`](https://github.com/lilnasy/gratelets/commit/fb2111d8601e8974cd2695a03030ee73093c9e3c) Thanks [@lilnasy](https://github.com/lilnasy)! - Includes previously missing files in the NPM package.

- [#32](https://github.com/lilnasy/gratelets/pull/32) [`fb2111d`](https://github.com/lilnasy/gratelets/commit/fb2111d8601e8974cd2695a03030ee73093c9e3c) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes typo where "adds" was written in place of "astro".

## 1.0.0

### Major Changes

- [#30](https://github.com/lilnasy/gratelets/pull/30) [`a5245a7`](https://github.com/lilnasy/gratelets/commit/a5245a7c69a18a23be50f5442b2b469805299e7d) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
