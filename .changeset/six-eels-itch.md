---
"astro-typed-api": minor
---

Adds support for using `devalue` for sending complex objects over the network.

To use `devalue` instead of JSON, set the `serialization` option to `"devalue"` in the `astro.config.js` file:

```js
// astro.config.js
import { defineConfig } from "astro/config"
import typedApi from "astro-typed-api"

export default defineConfig({
    integrations: [typedApi({ serialization: "devalue" })],
})
```
