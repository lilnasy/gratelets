# Contributing

This package is maintained by [lilnasy](https://github.com/lilnasy) independently from Astro.

The code for this package is commited to the repository as a series of patches applied on top of the [`withastro/adapters`](https://github.com/withastro/adapters) repository, which is where the code for the `@astrojs/cloudflare` adapter is maintained. Additionally, the `withastro/adapters` repository is added as a git submodule to make it easier to update the patches. The [`package.json`](https://github.com/lilnasy/gratelets/blob/main/packages/cloudflare-websocket/package.json#L43-L47) file contains scripts to automatically manage the upstream repository and the patches.

To introduce a change, make sure you're in `packages/cloudflare-websocket` directory:
```bash
../gratelets/ $ cd packages/cloudflare-websocket
```
If the folder is empty, it means that the submodule needs to be cloned from github:
```bash
../gratelets/packages/cloudflare-websocket/ $ git submodule update --init .
```
Then, run the `load_patches` script using `pnpm` to clone the upstream repository and apply the patches:
```bash
../gratelets/packages/cloudflare-websocket/ $ pnpm run load_patches
```
Now, you can browse around the code by going into the `withastro/adapters` submodule:
```bash
../gratelets/packages/cloudflare-websocket/ $ cd withastro/adapters/packages/cloudflare
../withastro/adapters/packages/cloudflare/ $ code .
```
After you've made the changes you want, you can commit them as normal. However, instead of pushing the changes, you would update the patches by running `create_patches` script using `pnpm`:
```bash
../gratelets/packages/cloudflare-websocket/ $ pnpm run create_patches
```
This will add and update patches present in `packages/cloudflare-websocket` with the changes you've made.

Now, you can commit these patch files to the gratelets repository, and push.
```bash
../withastro/adapters/packages/cloudflare/ $ cd ../../../..
../gratelets/packages/cloudflare-websocket/ $ git commit -m "fix bug"
../gratelets/packages/cloudflare-websocket/ $ git push
```

## Updating the upstream repository

Steps to bring the package up-to-date with features and fixes added in the official `@astrojs/cloudflare` package:

If there have been changes made to package, ensure no work is lost by commiting the changes:
```bash
../cloudflare-websocket/withastro/astro $ git commit -am "changes"
```
Fetch the latest tags from the upstream repository...
```bash
../cloudflare-websocket/withastro/astro $ git fetch --tags
```
Make note of the hashes of the patch commits made on top of the upstream repository:
```bash
../cloudflare-websocket/withastro/astro $ git log --oneline -n3
```
Checkout the tag corresponding to the latest release of `@astrojs/cloudflare` from the upstream repository:
```bash
../cloudflare-websocket/withastro/astro $ git checkout tags/@astrojs/cloudflare@12.<minor>.<patch>
```
Cherry pick the commits we made note of earlier:
```bash
../cloudflare-websocket/withastro/astro $ git cherry-pick <hash1> <hash2> <hash3>
```
Now, we can save the changes as patch files:
```bash
../cloudflare-websocket/withastro/astro $ git format-patch tags/@astrojs/cloudflare@12.<minor>.<patch>  -o ../..
```
