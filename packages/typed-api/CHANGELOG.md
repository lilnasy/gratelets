# astro-typed-api

## 0.5.1

### Patch Changes

- [#161](https://github.com/lilnasy/gratelets/pull/161) [`2894884`](https://github.com/lilnasy/gratelets/commit/2894884712498db4b710fdf4398d6e51b225a816) Thanks [@lilnasy](https://github.com/lilnasy)! - To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

  A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

  Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.

## 0.5.0

### Minor Changes

- [#132](https://github.com/lilnasy/gratelets/pull/132) [`cf3311b`](https://github.com/lilnasy/gratelets/commit/cf3311b9fe194456999bae58a403beeb3790d68b) Thanks [@lilnasy](https://github.com/lilnasy)! - Typed API routes are now reusable throughout your project!

  You can define your main application logic in API routes, and then use it for server-side rendering static HTML by calling it from the frontmatter of your pages.

  ```astro
  ---
  import { api } from "astro-typed-api/client"
  const results = await api.search.GET.fetch({ query: Astro.params.query })
  ---
  {results.map(result => <div>{result.title}</div>)}
  ```

  The `cookies`, `headers`, `locals`, and `request` objects are automatically populated with the current request's values.

## 0.4.0

### Minor Changes

- [#129](https://github.com/lilnasy/gratelets/pull/129) [`dc95fdb`](https://github.com/lilnasy/gratelets/commit/dc95fdb6b6eec49ad4f21f3b6863dbf7f4436dc0) Thanks [@lilnasy](https://github.com/lilnasy)! - Adds support for type-safe custom error handling!

  On the server-side, you now have access to the `error()` function in the `TypedAPIContext`.

  ```ts
  // src/api/search.ts
  import { defineApiRoute } from "astro-typed-api/server";

  export const GET = defineApiRoute({
    fetch({ query }: { query: string }, { locals, error }) {
      if (locals.loggedInInfo) {
        return ["search result 1", "search result 2"];
      } else {
        return error("login required");
      }
    },
  });
  ```

  On the client-side, the error details are available inside the `.catch` handler.

  ```ts
  import { api, CustomError } from "astro-typed-api/client"

  const searchResults =
      await api.search.GET.fetch({ query: "science" })
          .catch(error => {
              if (error instance of CustomError) {
                  // error.reason is inferred from the server-side error() call
                  const reason: "login required" = error.reason
              }
          })
  ```

- [#129](https://github.com/lilnasy/gratelets/pull/129) [`dc95fdb`](https://github.com/lilnasy/gratelets/commit/dc95fdb6b6eec49ad4f21f3b6863dbf7f4436dc0) Thanks [@lilnasy](https://github.com/lilnasy)! - Adds support for using `devalue` for sending complex objects over the network.

  To use `devalue` instead of JSON, set the `serialization` option to `"devalue"` in the `astro.config.js` file:

  ```js
  // astro.config.js
  import { defineConfig } from "astro/config";
  import typedApi from "astro-typed-api";

  export default defineConfig({
    integrations: [typedApi({ serialization: "devalue" })],
  });
  ```

## 0.3.0

### Minor Changes

- [#106](https://github.com/lilnasy/gratelets/pull/106) [`55d85cc`](https://github.com/lilnasy/gratelets/commit/55d85cc9ad4272636e282cc9ba151c702d2beddf) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the generated types are written to `<root>/.astro/astro-typed-api/types.d.ts`.

## 0.2.2

### Patch Changes

- [#81](https://github.com/lilnasy/gratelets/pull/81) [`07166b4`](https://github.com/lilnasy/gratelets/commit/07166b4b972c64d40586d4d5d84996c7577435b5) Thanks [@lilnasy](https://github.com/lilnasy)! - Prevents error overlay from appearing in dev mode for user errors. Astro's error overlay appears whenever a server side error occurs. For server-side rendering html, it's important to pay attention to them. However, for APIs, an error is just another response - it is unintended for it to take over the browser.

## 0.2.1

### Patch Changes

- [#65](https://github.com/lilnasy/gratelets/pull/65) [`6a64dd4`](https://github.com/lilnasy/gratelets/commit/6a64dd4dbb2f6b07d9eb2ff52e63e8955301f9d2) Thanks [@lilnasy](https://github.com/lilnasy)! - Adds a helpful typescript error for when an export is not uppercase.

## 0.2.0

### Minor Changes

- [#59](https://github.com/lilnasy/gratelets/pull/59) [`9cd7f72`](https://github.com/lilnasy/gratelets/commit/9cd7f72c53d0ebd2b921ab1026e7c553f0d67316) Thanks [@lilnasy](https://github.com/lilnasy)! - **Breaking change**: The minimum required astro version is now 4.1.

  Fixes an issue where having trailingSlash configured prevented API calls from being routed correctly.

## 0.1.2

### Patch Changes

- [#53](https://github.com/lilnasy/gratelets/pull/53) [`f5b4b95`](https://github.com/lilnasy/gratelets/commit/f5b4b954765ac6e45a1c192350d491a8a0f402ac) Thanks [@lilnasy](https://github.com/lilnasy)! - Improves compatibility with environments that do not support top-level await.

## 0.1.1

### Patch Changes

- [#49](https://github.com/lilnasy/gratelets/pull/49) [`e2c2288`](https://github.com/lilnasy/gratelets/commit/e2c22884aea08d3448bd682f87f7bafcfef1e09d) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where a necessary was not included in the NPM package.

## 0.1.0

### Minor Changes

- [#37](https://github.com/lilnasy/gratelets/pull/37) [`b552bdd`](https://github.com/lilnasy/gratelets/commit/b552bdd56a367b1961d6ef41ebbba042595acf0b) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
