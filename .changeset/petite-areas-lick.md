---
"astro-adds-to-head": patch
"astro-bun-websocket": patch
"astro-client-interaction": patch
"astro-cloudflare-websocket": patch
"astro-deno-websocket": patch
"astro-dynamic-import": patch
"astro-emotion": patch
"@emotion-extract/vite": patch
"astro-global": patch
"astro-prerender-patterns": patch
"astro-scope": patch
"astro-server-only-modules": patch
"astro-typed-api": patch
---

To mitigate the possibility of supply chain attacks, the publishing automation for the package is now managed completely without NPM tokens and API keys. The github actions workflow responsible for building and releasing the packages is directly hooked up to NPM as a [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#how-trusted-publishing-works). The author @lilnasy's NPM and GitHub account is secured with two factor authentication. E-mail is NOT one of the used authentication factors.

A provenance statement are generated every time the package is built and published, viewable on the NPM page. The statement includes auditable metadata such as the source commit, the exact workflow description, and logs from the run. Given how provenance is presented in the UI as green check mark, it's important to point out that it is NOT an indication that there is nothing malicious going on. It simply allows you to track the progress of building the source code into the published package you will download.

Additionally, the package manager for this repo, pnpm, is configured to only allow dependencies that have been released for at least 7 days. This is a precaution against installing a compromised dependency before the author or the registry has had the time to identify and unpublish it. Note that this configuration only defends the maintainers and contributors of the package from supply chain attacks; users of the package must implement their own defenses.
