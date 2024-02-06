---
"astro-typed-api": patch
---

Prevents error overlay from appearing in dev mode for user errors. Astro's error overlay appears whenever a server side error occurs. For server-side rendering html, it's important to pay attention to them. However, for APIs, an error is just another response - it is unintended for it to take over the browser.
