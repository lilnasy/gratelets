# astro-client-interaction

## 1.2.1

### Patch Changes

- [#161](https://github.com/lilnasy/gratelets/pull/161) [`2894884`](https://github.com/lilnasy/gratelets/commit/2894884712498db4b710fdf4398d6e51b225a816) Thanks [@lilnasy](https://github.com/lilnasy)! - To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

  A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

  Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.

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
