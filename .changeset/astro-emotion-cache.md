---
"astro-emotion": minor
---

Optimizes the extraction of styles by using a cache. Parsing of the source code of the modules importing `astro-emotiion`, and replacement of styles with generated class names is now skipped if the exact source code was previously processed. This prevents unnecessary work caused by the fact that most files are processed twice, once for SSR and once for the client.
