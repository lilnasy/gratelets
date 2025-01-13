---
"astro-typed-api": minor
---

Typed API routes are now reusable throughout your project!

You can define your main application logic in API routes, and then use it for server-side rendering static HTML by calling it from the frontmatter of your pages.

```astro
---
import { api } from "astro-typed-api/client"
const results = await api.search.GET.fetch({ query: Astro.params.query })
---
{results.map(result => <div>{result.title}</div>)}
```

The `cookies`, `headers`, `locals`, and `request` objects are automatically populated with the current request's values.
