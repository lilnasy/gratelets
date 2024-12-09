# astro-client-interaction

## 1.2.0

### Minor Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package fields to allow installation alongside Astro 5. This is a clerical change, and the behavior of the integration itself is unchanged.

## 1.1.0

### Minor Changes

- [#83](https://github.com/lilnasy/gratelets/pull/83) [`e19eab0`](https://github.com/lilnasy/gratelets/commit/e19eab0feba92c492cdc89d2a4b15f284d683142) Thanks [@leomp12](https://github.com/leomp12)! - Introduces the "idle" value to the `client:interaction` directive. When set, an interaction will schedule the loading of the component for when the browser is idle, instead of loading it immediately.

  ```astro
  ---
  import Component from "../components/Counter.jsx"
  ---
  <Component client:interaction="idle" />
  ```

  By default, a component with the `client:interaction` directive could be loaded before or after the ones with the `client:idle` directive, depending on the timing of the first interaction. This feature allows `client:interaction` components to predictably lower loading priority than `client:idle` components.

## 1.0.0

### Major Changes

- [#79](https://github.com/lilnasy/gratelets/pull/79) [`2e47043`](https://github.com/lilnasy/gratelets/commit/2e47043982f8695b9f8ace4139b694c502452be2) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
