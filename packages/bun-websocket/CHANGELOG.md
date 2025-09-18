# astro-bun-websocket

## 1.0.5

### Patch Changes

- [#161](https://github.com/lilnasy/gratelets/pull/161) [`2894884`](https://github.com/lilnasy/gratelets/commit/2894884712498db4b710fdf4398d6e51b225a816) Thanks [@lilnasy](https://github.com/lilnasy)! - To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

  A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

  Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.

## 1.0.4

### Patch Changes

- [#143](https://github.com/lilnasy/gratelets/pull/143) [`c8af2a6`](https://github.com/lilnasy/gratelets/commit/c8af2a683790240dd48e412f52cf64224a921b64) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixed an issue where binary messages weren't properly converted to `Blob` objects.

## 1.0.3

### Patch Changes

- [#136](https://github.com/lilnasy/gratelets/pull/136) [`462bfa9`](https://github.com/lilnasy/gratelets/commit/462bfa9e27447f839d752d13af5cdb77f587dc48) Thanks [@lilnasy](https://github.com/lilnasy)! - Removed an unused dependency from the package's dependency list.

## 1.0.2

### Patch Changes

- [#134](https://github.com/lilnasy/gratelets/pull/134) [`1fe8f3a`](https://github.com/lilnasy/gratelets/commit/1fe8f3a6cfb1f6f50ba7305cbd84130dd63d76c1) Thanks [@lilnasy](https://github.com/lilnasy)! - The package has been updated to bring in features and improvements from `@NuroDev/astro-bun@2.0.5`.

## 1.0.1

### Patch Changes

- [#114](https://github.com/lilnasy/gratelets/pull/114) [`ab033d4`](https://github.com/lilnasy/gratelets/commit/ab033d4b4e75d5dbd291ff5157d09a2cf3bfe45f) Thanks [@lilnasy](https://github.com/lilnasy)! - Updated the documentation to include a section on authentication.

- [#114](https://github.com/lilnasy/gratelets/pull/114) [`ab033d4`](https://github.com/lilnasy/gratelets/commit/ab033d4b4e75d5dbd291ff5157d09a2cf3bfe45f) Thanks [@lilnasy](https://github.com/lilnasy)! - Removed an unnecessary dependency from the NPM package.

## 1.0.0

### Major Changes

- [#112](https://github.com/lilnasy/gratelets/pull/112) [`18d9e18`](https://github.com/lilnasy/gratelets/commit/18d9e18e13ae5766909b13904db4b94d37cc0083) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
