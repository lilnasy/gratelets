# astro-stylex

## 0.3.0

### Minor Changes

- [#76](https://github.com/lilnasy/gratelets/pull/76) [`7dd1ec8`](https://github.com/lilnasy/gratelets/commit/7dd1ec8de6bbbf4c307136b5da04b85887a6c1c7) Thanks [@lilnasy](https://github.com/lilnasy)! - **Breaking**: The required `@stylexjs/stylex` version is now 0.5.1.

  Updates `@stylexjs/stylex` version to 0.5.1. This version introduces a new API for non-react UI frameworks: `stylex.attrs()`.

  Previously, svelte users had to create a wrapper function around `stylex.props()`, which returned the `className` prop intended only for React. The newly introduced `stylex.attrs()` returns the generated classes in the `class` props, allowing it to work across frameworks.

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

## 0.2.0

### Minor Changes

- [#55](https://github.com/lilnasy/gratelets/pull/55) [`6b23b19`](https://github.com/lilnasy/gratelets/commit/6b23b19a7418fb19a0c6d06935debf64fff1126d) Thanks [@enmanuelr](https://github.com/enmanuelr)! - Upgrading stylex dependency to 0.4.1

## 0.1.3

### Patch Changes

- [#45](https://github.com/lilnasy/gratelets/pull/45) [`875776b`](https://github.com/lilnasy/gratelets/commit/875776b320289778885e386fd6ab444835271ac7) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where stylex.defineVars could not be referenced in a component.

## 0.1.2

### Patch Changes

- [#41](https://github.com/lilnasy/gratelets/pull/41) [`0e76992`](https://github.com/lilnasy/gratelets/commit/0e7699258a0a94439816f3964abceb9ecb4eacdf) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where even after a full-page refresh, stale stylesheets were used.

## 0.1.1

### Patch Changes

- [#21](https://github.com/lilnasy/gratelets/pull/21) [`26c1470`](https://github.com/lilnasy/gratelets/commit/26c1470770a5d8c21fdd52c1503cac576ecc3242) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
