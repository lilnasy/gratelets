git submodule update --init

cd packages/node-websocket/withastro/astro
git config user.email "ci@c.i"
git config user.name "CI"
git am ../../*.patch
cd ../../../../

cd packages/bun-websocket/NuroDev/astro-bun
git config user.email "ci@c.i"
git config user.name "CI"
git am ../../*.patch
cd ../../../..

cd packages/deno-websocket/denoland/deno-astro-adapter
git config user.email "ci@c.i"
git config user.name "CI"
git am ../../*.patch
cd ../../../..

cd packages/cloudflare-websocket/withastro/adapters
git config user.email "ci@c.i"
git config user.name "CI"
git am ../../*.patch
cd ../../../..
