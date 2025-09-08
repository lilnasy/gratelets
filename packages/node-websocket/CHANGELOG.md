# astro-node-websocket

## 1.3.1

### Patch Changes

- [#156](https://github.com/lilnasy/gratelets/pull/156) [`15cdecf`](https://github.com/lilnasy/gratelets/commit/15cdecfb326a3a914d43778c8596bc4c28eb7bd9) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from [@astrojs/node@9.4.3](https://github.com/withastro/astro/blob/@astrojs/node@9.4.3/packages/integrations/node/CHANGELOG.md).

## 1.3.0

### Minor Changes

- [#153](https://github.com/lilnasy/gratelets/pull/153) [`82716e8`](https://github.com/lilnasy/gratelets/commit/82716e82537f76e7fc2e5f58597a9748dce02ba2) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/node@9.4.0`.

## 1.2.1

### Patch Changes

- [#151](https://github.com/lilnasy/gratelets/pull/151) [`86b47e3`](https://github.com/lilnasy/gratelets/commit/86b47e347f7985c67e2908c1f9a1264b5d56fd1b) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/node@9.3.1`.

## 1.2.0

### Minor Changes

- [#149](https://github.com/lilnasy/gratelets/pull/149) [`6b108f3`](https://github.com/lilnasy/gratelets/commit/6b108f36bf7207ccc53035efc0ec9f1e6c044b3a) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/node@9.3.0`.

## 1.1.3

### Patch Changes

- [#134](https://github.com/lilnasy/gratelets/pull/134) [`1fe8f3a`](https://github.com/lilnasy/gratelets/commit/1fe8f3a6cfb1f6f50ba7305cbd84130dd63d76c1) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/node@9.0.1`.

## 1.1.2

### Patch Changes

- [#114](https://github.com/lilnasy/gratelets/pull/114) [`ab033d4`](https://github.com/lilnasy/gratelets/commit/ab033d4b4e75d5dbd291ff5157d09a2cf3bfe45f) Thanks [@lilnasy](https://github.com/lilnasy)! - Updated the documentation to include a section on authentication.

## 1.1.1

### Patch Changes

- [#112](https://github.com/lilnasy/gratelets/pull/112) [`18d9e18`](https://github.com/lilnasy/gratelets/commit/18d9e18e13ae5766909b13904db4b94d37cc0083) Thanks [@lilnasy](https://github.com/lilnasy)! - Updated the package to include relevant keywords on NPM.

## 1.1.0

### Minor Changes

- [#110](https://github.com/lilnasy/gratelets/pull/110) [`bf438fd`](https://github.com/lilnasy/gratelets/commit/bf438fd1fedae6c6be3b146dc8bc0480475605ae) Thanks [@lilnasy](https://github.com/lilnasy)! - Introduces a helper to determine whether the current request can be upgraded to a WebSocket connection. You can now read the `isUpgradeRequest` property from the `locals` object to decide how to handle the request.

  ```ts
  export const GET: APIRoute = ctx => {
      if (ctx.locals.isUpgradeRequest) {
          const { response, socket } = ctx.locals.upgradeWebSocket()
          ...
      }
      ...
  }
  ```

## 1.0.0

### Major Changes

- [#108](https://github.com/lilnasy/gratelets/pull/108) [`418ee0b`](https://github.com/lilnasy/gratelets/commit/418ee0baeeee0be4e721fb908cd998bdbaee8cac) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
