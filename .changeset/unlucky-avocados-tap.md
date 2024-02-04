---
"astro-stylex": minor
---

**Breaking**: The required `@stylexjs/stylex` version is now 0.5.1.

Updates `@stylexjs/stylex` version to 0.5.1. This version introduces a new API for non-react UI frameworks: `stylex.attrs()`.

Previously, svelte users had to create a wrapper function around `stylex.props()`, which returned the `className` prop intended only for React. The newly introduced `stylex.attrs()` returns the generated classes in the `class` props, allowing it to work across frameworks.

```svelte
<script context="module">
  import stylex from "@stylexjs/stylex"
  const colorStyles = stylex.create({
        red: {
            backgroundColor: 'red',
            borderColor: 'darkred',
        },
        green: {
            backgroundColor: 'lightgreen',
            borderColor: 'darkgreen',
        },
    });
</script>
<button {...stylex.attrs(colorStyles.red)} />
<button {...stylex.attrs(colorStyles.green)} />
```
