# astro-emotion

## 3.0.0

### Major Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the types are automatically added to your project when you import the integration to the Astro configuration file.

  References to `astro-dynamic-import/client` for types can now safely be removed from your project.

### Minor Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Optimizes the extraction of styles by using a cache. Parsing of the source code of the modules importing `astro-emotiion`, and replacement of styles with generated class names is now skipped if the exact source code was previously processed. This prevents unnecessary work caused by the fact that most files are processed twice, once for SSR and once for the client.

## 2.0.0

### Major Changes

- [#104](https://github.com/lilnasy/gratelets/pull/104) [`278199a`](https://github.com/lilnasy/gratelets/commit/278199a8dcc40aa2eb9c8cc0444f9bcfe1a4aaaf) Thanks [@lilnasy](https://github.com/lilnasy)! - **New features**:

  - You can now customize the emotion instance by passing options to the integration! For example, the following option will change the generated class name pattern from `e-xxxxx` to `css-xxxxx`:

  ```ts
  defineConfig({
      ...
      integrations: [emotion({ key: "css" })]
      ...
  })
  ```

  - During development, changes made to css blocks will now reflect immediately on the browser without a full page refresh!

  **Internal changes**:

  - Naming of the generated css files has been updated to use hashes. This prevents noisy 404 requests that appear when the dev server is restarted while a browser tab is open with the preview.

  **Breaking changes**:

  - The hashing uses node's [`crypto.hash()`](https://nodejs.org/api/crypto.html#cryptohashalgorithm-data-outputencoding) function, which is only available starting Node v20.12. Node 18 is no longer supported. Please use either Node v20 or v22.

## 1.0.1

### Patch Changes

- [#16](https://github.com/lilnasy/gratelets/pull/16) [`f626698`](https://github.com/lilnasy/gratelets/commit/f62669833917448a9c52546e977aa90a40e694fb) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where a required file was not included in the NPM package.

## 1.0.0

### Major Changes

- [#13](https://github.com/lilnasy/gratelets/pull/13) [`2c636f4`](https://github.com/lilnasy/gratelets/commit/2c636f4bf10ecc36fa066310bd0a22348ead81b1) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
