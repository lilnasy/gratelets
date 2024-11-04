---
"astro-emotion": major
---
**New features**:
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
