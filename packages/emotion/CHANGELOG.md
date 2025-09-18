# astro-emotion

## 3.0.1

### Patch Changes

- [#161](https://github.com/lilnasy/gratelets/pull/161) [`2894884`](https://github.com/lilnasy/gratelets/commit/2894884712498db4b710fdf4398d6e51b225a816) Thanks [@lilnasy](https://github.com/lilnasy)! - To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

  A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

  Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.

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
