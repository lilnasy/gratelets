# Contributing

The code for this package is commited to the repository as a series of patches applied on top of the [`withastro/adapters`](https://github.com/withastro/adapters) repository, which is where the code for the official `@astrojs/node` adapter is maintained. Additionally, the `withastro/adapters` repository is added as a git submodule to make it easier to update the patches. The [`package.json`](https://github.com/lilnasy/gratelets/blob/main/packages/node-websocket/package.json#L29-L33) file contains scripts to automatically manage the upstream repository and the patches.

To introduce a change, make sure you're in `packages/node-websocket` directory:
```bash
../gratelets/ $ cd packages/node-websocket
```
If the folder is empty, it means that the submodule needs to be cloned from github:
```bash
../gratelets/packages/node-websocket/ $ git submodule update --init .
```
Then, run the `load_patches` script using `pnpm` to clone the upstream repository and apply the patches:
```bash
../gratelets/packages/node-websocket/ $ pnpm run load_patches
```
Now, you can browse around the code by going into the `withastro/adapters` submodule:
```bash
../gratelets/packages/node-websocket/ $ cd withastro/adapters/packages/node
../adapters/packages/node/ $ code .
```
Note that dependencies would need to separately be installed in the `withastro/adapters` submodule. You can optionally provide the [`--filter`](https://pnpm.io/filtering) option to pnpm to install only the dependencies relevant to the node adapter package.
```bash
../adapters/packages/node/ $ pnpm --filter @astrojs/node install
```
After you've made the changes you want, you can commit them as normal. However, instead of pushing the changes, you would update the patches by running `create_patches` script using `pnpm`:
```bash
../adapters/packages/node/ $ pnpm run create_patches
```
This will add and update patches present in `packages/node-websocket` with the changes you've made.

Now, you can commit these patch files to the gratelets repository, and push.
```bash
../adapters/packages/node/ $ cd ../../../..
../gratelets/packages/node-websocket/ $ git commit -m "fix bug"
../gratelets/packages/node-websocket/ $ git push
```

## Updating the upstream repository

Steps to bring the package up-to-date with features and fixes added in the official `@astrojs/node` package:

If there have been changes made to package, ensure no work is lost by commiting the changes:
```bash
../node-websocket/withastro/astro $ git commit -am "changes"
```
Fetch the latest tags from the upstream repository...
```bash
../node-websocket/withastro/astro $ git fetch --tags
```
Make note of the hashes of our patch commits made on top of the upstream repository:
```bash
../node-websocket/withastro/astro $ git log --oneline -n3
```
Checkout the tag corresponding to the latest release of `@astrojs/node` from the upstream repository:
```bash
../node-websocket/withastro/astro $ git checkout tags/@astrojs/node@9.<minor>.<patch>
```
Cherry pick the commits we made note of earlier:
```bash
../node-websocket/withastro/astro $ git cherry-pick <hash1> <hash2> <hash3>
```
Now, we can save the changes as patch files:
```bash
../node-websocket/withastro/astro $ git format-patch tags/@astrojs/node@9.<minor>.<patch>  -o ../..
```
