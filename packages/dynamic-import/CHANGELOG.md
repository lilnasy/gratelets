# astro-dynamic-import

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
