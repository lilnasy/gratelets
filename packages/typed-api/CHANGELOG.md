# astro-typed-api

## 0.3.0

### Minor Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the generated types are written to `<root>/.astro/astro-typed-api/types.d.ts`.

## 0.2.2

### Patch Changes

- [#81](https://github.com/lilnasy/gratelets/pull/81) [`07166b4`](https://github.com/lilnasy/gratelets/commit/07166b4b972c64d40586d4d5d84996c7577435b5) Thanks [@lilnasy](https://github.com/lilnasy)! - Prevents error overlay from appearing in dev mode for user errors. Astro's error overlay appears whenever a server side error occurs. For server-side rendering html, it's important to pay attention to them. However, for APIs, an error is just another response - it is unintended for it to take over the browser.

## 0.2.1

### Patch Changes

- [#65](https://github.com/lilnasy/gratelets/pull/65) [`6a64dd4`](https://github.com/lilnasy/gratelets/commit/6a64dd4dbb2f6b07d9eb2ff52e63e8955301f9d2) Thanks [@lilnasy](https://github.com/lilnasy)! - Adds a helpful typescript error for when an export is not uppercase.

## 0.2.0

### Minor Changes

- [#59](https://github.com/lilnasy/gratelets/pull/59) [`9cd7f72`](https://github.com/lilnasy/gratelets/commit/9cd7f72c53d0ebd2b921ab1026e7c553f0d67316) Thanks [@lilnasy](https://github.com/lilnasy)! - **Breaking change**: The minimum required astro version is now 4.1.

  Fixes an issue where having trailingSlash configured prevented API calls from being routed correctly.

## 0.1.2

### Patch Changes

- [#53](https://github.com/lilnasy/gratelets/pull/53) [`f5b4b95`](https://github.com/lilnasy/gratelets/commit/f5b4b954765ac6e45a1c192350d491a8a0f402ac) Thanks [@lilnasy](https://github.com/lilnasy)! - Improves compatibility with environments that do not support top-level await.

## 0.1.1

### Patch Changes

- [#49](https://github.com/lilnasy/gratelets/pull/49) [`e2c2288`](https://github.com/lilnasy/gratelets/commit/e2c22884aea08d3448bd682f87f7bafcfef1e09d) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where a necessary was not included in the NPM package.

## 0.1.0

### Minor Changes

- [#37](https://github.com/lilnasy/gratelets/pull/37) [`b552bdd`](https://github.com/lilnasy/gratelets/commit/b552bdd56a367b1961d6ef41ebbba042595acf0b) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
