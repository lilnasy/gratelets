---
"astro-dynamic-import": patch
---

Fixes an issue where the integration attempted to read a file (env.d.ts) that does not exist in Astro 5.x projects.
