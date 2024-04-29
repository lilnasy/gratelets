---
"astro-dynamic-import": patch
---

Fixes an issue where an internally used module (`"astro-dynamic-import:internal"`) would sometimes fail to be resolved by vite.
