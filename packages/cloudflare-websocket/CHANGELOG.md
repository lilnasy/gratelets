# astro-cloudflare-websocket

## 1.1.3

### Patch Changes

- [#161](https://github.com/lilnasy/gratelets/pull/161) [`2894884`](https://github.com/lilnasy/gratelets/commit/2894884712498db4b710fdf4398d6e51b225a816) Thanks [@lilnasy](https://github.com/lilnasy)! - To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

  A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

  Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.

## 1.1.2

### Patch Changes

- [#157](https://github.com/lilnasy/gratelets/pull/157) [`f1d76ca`](https://github.com/lilnasy/gratelets/commit/f1d76cae5bea388c513a31b90b8b58853cccd6dc) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from [@astrojs/cloudflare@12.6.8](https://github.com/withastro/astro/blob/@astrojs/cloudflare@12.6.8/packages/integrations/cloudflare/CHANGELOG.md).

## 1.1.1

### Patch Changes

- [#153](https://github.com/lilnasy/gratelets/pull/153) [`82716e8`](https://github.com/lilnasy/gratelets/commit/82716e82537f76e7fc2e5f58597a9748dce02ba2) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/cloudflare@12.6.3`.

## 1.1.0

### Minor Changes

- [#151](https://github.com/lilnasy/gratelets/pull/151) [`86b47e3`](https://github.com/lilnasy/gratelets/commit/86b47e347f7985c67e2908c1f9a1264b5d56fd1b) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/cloudflare@12.6.0`

## 1.0.2

### Patch Changes

- [#136](https://github.com/lilnasy/gratelets/pull/136) [`462bfa9`](https://github.com/lilnasy/gratelets/commit/462bfa9e27447f839d752d13af5cdb77f587dc48) Thanks [@lilnasy](https://github.com/lilnasy)! - Removed an unused dependency from the package's dependency list.

- [#136](https://github.com/lilnasy/gratelets/pull/136) [`462bfa9`](https://github.com/lilnasy/gratelets/commit/462bfa9e27447f839d752d13af5cdb77f587dc48) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixed an issue where the platform proxy was not available for websocket requests in dev mode.

## 1.0.1

### Patch Changes

- [#134](https://github.com/lilnasy/gratelets/pull/134) [`1fe8f3a`](https://github.com/lilnasy/gratelets/commit/1fe8f3a6cfb1f6f50ba7305cbd84130dd63d76c1) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@astrojs/cloudflare@12.2.1`.

## 1.0.0

### Major Changes

- [#119](https://github.com/lilnasy/gratelets/pull/119) [`be20c23`](https://github.com/lilnasy/gratelets/commit/be20c23f21eeeab2a45408b326debc3673af4e0a) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
