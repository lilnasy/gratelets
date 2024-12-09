---
"astro-dynamic-import": major
---

Updates the package to support changes in how Astro 5 handles generated types. Changes to `env.d.ts` are no longer performed, and the types are automatically added to your project when you import the integration to the Astro configuration file.

References to `astro-dynamic-import/client` for types can now safely be removed from your project.
