---
"astro-client-interaction": minor
---

Introduces the "idle" value to the `client:interaction` directive. When set, an interaction will schedule the loading of the component for when the browser is idle, instead of loading it immediately.

```astro
---
import Component from "../components/Counter.jsx"
---
<Component client:interaction="idle" />
```

By default, a component with the `client:interaction` directive could be loaded before or after the ones with the `client:idle` directive, depending on the timing of the first interaction. This feature allows `client:interaction` components to predictably lower loading priority than `client:idle` components.
