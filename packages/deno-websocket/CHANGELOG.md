# astro-deno-websocket

## 1.1.1

### Patch Changes

- [#161](https://github.com/lilnasy/gratelets/pull/161) [`2894884`](https://github.com/lilnasy/gratelets/commit/2894884712498db4b710fdf4398d6e51b225a816) Thanks [@lilnasy](https://github.com/lilnasy)! - To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

  A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

  Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.

## 1.1.0

### Minor Changes

- [#143](https://github.com/lilnasy/gratelets/pull/143) [`c8af2a6`](https://github.com/lilnasy/gratelets/commit/c8af2a683790240dd48e412f52cf64224a921b64) Thanks [@lilnasy](https://github.com/lilnasy)! - Aligned production behavior of binary messages to match dev mode. Now, binary messages are consistently provided as `Blob` objects by default.

## 1.0.0

### Major Changes

- [#114](https://github.com/lilnasy/gratelets/pull/114) [`ab033d4`](https://github.com/lilnasy/gratelets/commit/ab033d4b4e75d5dbd291ff5157d09a2cf3bfe45f) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release.
